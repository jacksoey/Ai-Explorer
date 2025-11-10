
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';
import type { GroundingChunk } from '../../types';


const WebSearch: React.FC = () => {
    const [prompt, setPrompt] = useState("Who won the most recent F1 race?");
    const [response, setResponse] = useState('');
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResponse('');
        setSources([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            setResponse(result.text);
            const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
                 setSources(groundingMetadata.groundingChunks);
            }
        } catch (e: any) {
            setError(`API Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <Input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask a question about current events..."
                    disabled={isLoading}
                />
                <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()}>
                    Search
                </Button>
            </form>

            {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

            {isLoading && !response && (
                <div className="flex justify-center items-center p-4 bg-gray-800/50 rounded-lg min-h-[100px]">
                    <Spinner />
                </div>
            )}

            {response && (
                <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
                    <div>
                        <h3 className="font-semibold text-indigo-300 mb-2">Answer:</h3>
                        <p className="whitespace-pre-wrap text-gray-200">{response}</p>
                    </div>

                    {sources.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-indigo-300 mb-2 border-t border-gray-700 pt-4">Sources:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {/* FIX: Check for source.web and source.web.uri before rendering to handle optional properties, and provide a fallback for the title. */}
                                {sources.map((source, index) => source.web?.uri && (
                                    <li key={index}>
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WebSearch;
