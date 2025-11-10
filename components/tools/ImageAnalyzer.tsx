
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { FileUpload } from '../common/FileUpload';
import { Spinner } from '../common/Spinner';
import { fileToBase64 } from '../../utils/fileUtils';


const ImageAnalyzer: React.FC = () => {
    const [prompt, setPrompt] = useState("What's in this picture?");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (file: File) => {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !imageFile || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResponse('');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Image = await fileToBase64(imageFile);

            const imagePart = {
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Image,
                },
            };
            const textPart = {
                text: prompt,
            };

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [textPart, imagePart] },
            });
            
            setResponse(result.text);

        } catch (e: any) {
            setError(`API Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FileUpload 
                    onFileSelect={handleFileSelect} 
                    previewUrl={previewUrl}
                    label="Upload Image"
                    accept="image/*"
                />
                <Textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask something about the image..."
                    rows={3}
                    disabled={isLoading}
                />
                <Button type="submit" isLoading={isLoading} disabled={!prompt.trim() || !imageFile}>
                    Analyze Image
                </Button>
            </form>
            
            {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

            {isLoading && !response && (
                <div className="flex justify-center items-center p-4 bg-gray-800/50 rounded-lg min-h-[100px]">
                    <Spinner />
                </div>
            )}
            
            {response && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold text-indigo-300 mb-2">Analysis:</h3>
                    <p className="whitespace-pre-wrap text-gray-200">{response}</p>
                </div>
            )}
        </div>
    );
};

export default ImageAnalyzer;
