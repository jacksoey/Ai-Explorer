
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Spinner } from '../common/Spinner';

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('A photorealistic image of a majestic lion in the savanna at sunset.');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const result = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });
            
            const base64ImageBytes = result.generatedImages[0]?.image?.imageBytes;
            if (base64ImageBytes) {
                setImageUrl(`data:image/jpeg;base64,${base64ImageBytes}`);
            } else {
                setError("Image generation failed. No image data received.");
            }

        } catch (e: any) {
            setError(`API Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    rows={4}
                    disabled={isLoading}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                    <div className="flex flex-wrap gap-2">
                        {aspectRatios.map(ratio => (
                            <button
                                key={ratio}
                                type="button"
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-4 py-2 text-sm rounded-md transition-colors ${aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>

                <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()}>
                    Generate Image
                </Button>
            </form>
            
            {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

            {isLoading && (
                <div className="flex justify-center items-center p-4 bg-gray-800/50 rounded-lg min-h-[200px]">
                    <Spinner />
                    <p className="ml-4">Generating your masterpiece...</p>
                </div>
            )}
            
            {imageUrl && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold text-indigo-300 mb-2">Generated Image:</h3>
                    <img src={imageUrl} alt="Generated result" className="max-w-full mx-auto rounded-lg shadow-md" />
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;
