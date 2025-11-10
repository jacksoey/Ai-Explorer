
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { FileUpload } from '../common/FileUpload';
import { Spinner } from '../common/Spinner';
import { fileToBase64 } from '../../utils/fileUtils';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('Add a retro filter');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setEditedImageUrl(null); // Clear previous result
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !imageFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Image = await fileToBase64(imageFile);

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      };
      const textPart = { text: prompt };

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const firstPart = result.candidates?.[0]?.content?.parts?.[0];
      if (firstPart && firstPart.inlineData) {
        const base64Bytes = firstPart.inlineData.data;
        setEditedImageUrl(`data:${firstPart.inlineData.mimeType};base64,${base64Bytes}`);
      } else {
        setError('No image was generated. The model may not have understood the prompt.');
      }
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
          label="Upload Image to Edit"
          accept="image/*"
        />
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your edit (e.g., add a cat, make it black and white)"
          disabled={isLoading}
        />
        <Button type="submit" isLoading={isLoading} disabled={!prompt.trim() || !imageFile}>
          Edit Image
        </Button>
      </form>
      
      {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

      {isLoading && (
        <div className="flex justify-center items-center p-4 bg-gray-800/50 rounded-lg min-h-[200px]">
          <Spinner />
          <p className="ml-4">Editing image...</p>
        </div>
      )}
      
      {editedImageUrl && (
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h3 className="font-semibold text-indigo-300 mb-2">Edited Image:</h3>
          <img src={editedImageUrl} alt="Edited result" className="max-w-full mx-auto rounded-lg shadow-md" />
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
