
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Spinner } from '../common/Spinner';

const MAX_FRAMES = 8;
const FRAME_INTERVAL_MS = 2000;

const VideoAnalyzer: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Describe what is happening in this video. What are the key objects and actions?');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setResponse('');
            setError(null);
        }
    };
    
    const extractFrames = (): Promise<string[]> => {
        return new Promise((resolve) => {
            if (!videoRef.current || !canvasRef.current) {
                resolve([]);
                return;
            }
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const frames: string[] = [];

            video.onloadeddata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                let capturedFrames = 0;
                
                const captureFrame = () => {
                    if (capturedFrames >= MAX_FRAMES || video.currentTime >= video.duration) {
                        video.onseeked = null; // clean up
                        resolve(frames.map(f => f.split(',')[1])); // return base64 data
                        return;
                    }

                    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL('image/jpeg'));
                    capturedFrames++;
                    setStatus(`Extracted frame ${capturedFrames} of ${MAX_FRAMES}...`);
                    
                    video.currentTime += video.duration / (MAX_FRAMES + 1);
                };

                video.onseeked = captureFrame;
                video.currentTime = video.duration / (MAX_FRAMES + 1);
            };

            video.load();
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoFile || isLoading) return;

        setIsLoading(true);
        setStatus('Preparing to extract frames...');
        setError(null);
        setResponse('');
        
        try {
            const frames = await extractFrames();
            if (frames.length === 0) {
                throw new Error("Could not extract any frames from the video.");
            }
            setStatus(`Sending ${frames.length} frames for analysis...`);
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const imageParts = frames.map(frameData => ({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: frameData,
                }
            }));

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [{text: prompt}, ...imageParts] },
            });
            
            setResponse(result.text);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
                <input type="file" accept="video/*" onChange={handleFileChange} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            </div>

            {videoUrl && (
                <div>
                    <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg" />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                 <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="What do you want to know about the video?"
                    rows={3}
                    disabled={isLoading}
                />
                <Button type="submit" isLoading={isLoading} disabled={!videoFile}>
                    Analyze Video
                </Button>
            </form>
            
            {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

            {(isLoading || response) && (
                <div className="p-4 bg-gray-800/50 rounded-lg min-h-[100px]">
                    {isLoading && (
                        <div className="flex items-center">
                            <Spinner size="sm" />
                            <p className="ml-3">{status}</p>
                        </div>
                    )}
                    {response && (
                        <div>
                            <h3 className="font-semibold text-indigo-300 mb-2">Video Analysis:</h3>
                            <p className="whitespace-pre-wrap text-gray-200">{response}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoAnalyzer;
