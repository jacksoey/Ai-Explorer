
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Spinner } from '../common/Spinner';
import { decode, decodeAudioData } from '../../utils/audioUtils';

// Define a type for the window object to include webkitAudioContext
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}

const TextToSpeech: React.FC = () => {
    const [text, setText] = useState('Hello! I am Gemini, ready to transform text into speech.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

    const outputAudioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext on mount and clean up on unmount
        outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        return () => {
            outputAudioContextRef.current?.close();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAudioBuffer(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text: `Say this: ${text}` }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                const buffer = await decodeAudioData(
                    decode(base64Audio),
                    outputAudioContextRef.current,
                    24000,
                    1
                );
                setAudioBuffer(buffer);
            } else {
                throw new Error("No audio data received from API.");
            }

        } catch (e: any) {
            setError(`API Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const playAudio = () => {
        if (!audioBuffer || !outputAudioContextRef.current) return;
        const source = outputAudioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContextRef.current.destination);
        source.start();
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to convert to speech..."
                    rows={5}
                    disabled={isLoading}
                />
                <Button type="submit" isLoading={isLoading} disabled={!text.trim()}>
                    Generate Speech
                </Button>
            </form>

            {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

            {isLoading && !audioBuffer && (
                <div className="flex justify-center items-center p-4 bg-gray-800/50 rounded-lg min-h-[60px]">
                    <Spinner size="sm"/>
                    <p className="ml-3">Generating audio...</p>
                </div>
            )}
            
            {audioBuffer && (
                <div className="p-4 bg-gray-800/50 rounded-lg flex items-center space-x-4">
                    <Button onClick={playAudio}>Play Audio</Button>
                    <p className="text-sm text-gray-300">Audio generated successfully.</p>
                </div>
            )}
        </div>
    );
};

export default TextToSpeech;
