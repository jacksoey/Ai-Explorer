
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';

const QuickChat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
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
      const resultStream = await ai.models.generateContentStream({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
      });

      for await (const chunk of resultStream) {
        setResponse(prev => prev + chunk.text);
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
          placeholder="Enter a prompt for a quick answer..."
          disabled={isLoading}
        />
        <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()}>
          Generate
        </Button>
      </form>

      {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

      { (isLoading || response) && (
        <div className="p-4 bg-gray-800/50 rounded-lg min-h-[100px]">
            <h3 className="font-semibold text-indigo-300 mb-2">Response:</h3>
            <p className="whitespace-pre-wrap text-gray-200">{response}</p>
            {isLoading && !response && <div className="flex justify-center items-center h-full"><Spinner /></div>}
        </div>
      )}
    </div>
  );
};

export default QuickChat;
