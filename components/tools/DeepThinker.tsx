
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Spinner } from '../common/Spinner';

const DeepThinker: React.FC = () => {
    const [prompt, setPrompt] = useState('Explain the theory of relativity as if you were explaining it to a curious 12-year-old, using simple analogies.');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    thinkingConfig: {
                        thinkingBudget: 32768,
                    },
                },
            });
            
            setResponse(result.text);

        } catch (e: any) {
            setError(`API Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <div className="p-3 bg-blue-900/30 border border-blue-500/50 text-blue-200 rounded-lg text-sm">
                <p><strong>Thinking Mode Enabled.</strong> This tool uses Gemini 2.5 Pro with maximum thinking budget for your most complex questions.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a complex prompt or question..."
                    rows={5}
                    disabled={isLoading}
                />
                <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()}>
                    Generate Insight
                </Button>
            </form>

            {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

            {isLoading && !response && (
                <div className="flex justify-center items-center p-4 bg-gray-800/50 rounded-lg min-h-[100px]">
                    <Spinner />
                    <p className="ml-3">Deep thinking in progress...</p>
                </div>
            )}
            
            {response && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold text-indigo-300 mb-2">Response:</h3>
                    <p className="whitespace-pre-wrap text-gray-200">{response}</p>
                </div>
            )}
        </div>
    );
};

export default DeepThinker;
