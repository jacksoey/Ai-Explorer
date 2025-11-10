
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';
import type { GroundingChunk } from '../../types';

const LocalExplorer: React.FC = () => {
    const [prompt, setPrompt] = useState("What are some good coffee shops near me?");
    const [response, setResponse] = useState('');
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState('Not requested');

    const handleGetLocation = () => {
        setLocationStatus('Requesting...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationStatus('Acquired');
                setError(null);
            },
            (err) => {
                setError(`Geolocation error: ${err.message}`);
                setLocationStatus('Denied');
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResponse('');
        setSources([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const toolConfig = location ? {
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.lat,
                            longitude: location.lng
                        }
                    }
                }
            } : {};
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{ googleMaps: {} }],
                    ...toolConfig,
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
            <div className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg">
                <Button onClick={handleGetLocation} disabled={locationStatus === 'Requesting...' || locationStatus === 'Acquired'}>
                    Use My Location
                </Button>
                <p className="text-sm text-gray-400">Status: {locationStatus}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <Input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask about places..."
                    disabled={isLoading}
                />
                <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()}>
                    Explore
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
                        <h3 className="font-semibold text-indigo-300 mb-2">Response:</h3>
                        <p className="whitespace-pre-wrap text-gray-200">{response}</p>
                    </div>

                    {sources.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-indigo-300 mb-2 border-t border-gray-700 pt-4">Places Mentioned:</h4>
                            <ul className="space-y-2">
                                {/* FIX: Check for source.maps and source.maps.uri before rendering to handle optional properties, and provide a fallback for the title. */}
                                {sources.map((source, index) => source.maps?.uri && (
                                    <li key={index}>
                                        <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                                            {source.maps.title || source.maps.uri}
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

export default LocalExplorer;
