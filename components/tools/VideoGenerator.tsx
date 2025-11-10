
import React, { useState } from 'react';
import { useVeo } from '../../hooks/useVeo';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Spinner } from '../common/Spinner';
import { FileUpload } from '../common/FileUpload';
import { ApiKeyDialog } from '../common/ApiKeyDialog';

type GenerationMode = 'text-to-video' | 'image-to-video';
type AspectRatio = '16:9' | '9:16';

const VideoGenerator: React.FC = () => {
    const { 
        isLoading, 
        isPolling, 
        videoUrl, 
        error, 
        generateVideo,
        hasApiKey,
        handleSelectKey,
        isCheckingKey
    } = useVeo();

    const [prompt, setPrompt] = useState('A majestic eagle soaring over a mountain range, cinematic lighting.');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mode, setMode] = useState<GenerationMode>('text-to-video');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

    const handleFileSelect = (file: File) => {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const imageToUse = mode === 'image-to-video' ? imageFile : null;
        if (!prompt.trim() || (mode === 'image-to-video' && !imageToUse)) {
            return;
        }
        generateVideo(prompt, imageToUse, aspectRatio);
    };

    const loadingMessages = [
        "Warming up the digital director's chair...",
        "Polishing the virtual camera lens...",
        "Teaching pixels to dance...",
        "This can take a few minutes. Time for a coffee?",
        "Rendering cinematic magic, frame by frame...",
        "Almost there, the final cut is approaching!"
    ];
    
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    
    React.useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    return loadingMessages[(currentIndex + 1) % loadingMessages.length];
                });
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    if (!hasApiKey) {
        return <ApiKeyDialog onSelectKey={handleSelectKey} isCheckingKey={isCheckingKey} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex space-x-2 p-1 bg-gray-700/50 rounded-lg">
                <button onClick={() => setMode('text-to-video')} className={`w-full py-2 text-sm font-medium rounded-md transition ${mode === 'text-to-video' ? 'bg-indigo-600' : 'hover:bg-gray-600/50'}`}>Text to Video</button>
                <button onClick={() => setMode('image-to-video')} className={`w-full py-2 text-sm font-medium rounded-md transition ${mode === 'image-to-video' ? 'bg-indigo-600' : 'hover:bg-gray-600/50'}`}>Image to Video</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'image-to-video' && (
                     <FileUpload 
                        onFileSelect={handleFileSelect} 
                        previewUrl={previewUrl}
                        label="Upload Starting Image"
                        accept="image/*"
                    />
                )}
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the video you want to create..."
                    rows={4}
                    disabled={isLoading}
                />
                
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                            <button
                                key={ratio}
                                type="button"
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-4 py-2 text-sm rounded-md transition-colors ${aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                            </button>
                        ))}
                    </div>
                </div>

                <Button type="submit" isLoading={isLoading} disabled={!prompt.trim() || (mode === 'image-to-video' && !imageFile)}>
                    {isLoading ? 'Generating...' : 'Generate Video'}
                </Button>
            </form>

            {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

            {isLoading && (
                <div className="flex flex-col justify-center items-center p-4 bg-gray-800/50 rounded-lg min-h-[200px]">
                    <Spinner size="lg"/>
                    <p className="mt-4 text-lg font-semibold">{isPolling ? 'Polling for result...' : 'Starting generation...'}</p>
                    <p className="mt-2 text-sm text-gray-400">{loadingMessage}</p>
                </div>
            )}
            
            {videoUrl && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold text-indigo-300 mb-2">Generated Video:</h3>
                    <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-md"></video>
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;
