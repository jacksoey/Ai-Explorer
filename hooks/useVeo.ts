
import { useState, useCallback, useEffect, useRef } from 'react';
// FIX: Import `GenerateVideosOperation` for correct typing from the SDK.
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { fileToBase64 } from '../utils/fileUtils';

// FIX: Removed incorrect local VeoOperation interface.
// The SDK's `GenerateVideosOperation` type will be used instead.

export const useVeo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  const pollingIntervalRef = useRef<number | null>(null);

  const checkApiKey = useCallback(async () => {
    setIsCheckingKey(true);
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keyStatus);
      } else {
         // aistudio might not be available in all environments
         setHasApiKey(false);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setHasApiKey(false);
    } finally {
      setIsCheckingKey(false);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
    // No cleanup needed for polling here, it's managed by the generate function
    return () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSelectKey = async () => {
    try {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Assume key selection is successful and re-check.
            // Race condition mitigation: just set to true optimistically
            setHasApiKey(true); 
            setError(null);
        }
    } catch (e) {
        console.error("Error opening key selection:", e);
        setError("Failed to open API key selection dialog.");
    }
  };


  // FIX: Parameter `operation` is now correctly typed with `GenerateVideosOperation`.
  const pollOperation = useCallback(async (operation: GenerateVideosOperation, ai: GoogleGenAI) => {
    setIsPolling(true);
    let currentOperation = operation;

    while (!currentOperation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      try {
        currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
      } catch (e: any) {
        setError(`Polling failed: ${e.message}`);
        setIsLoading(false);
        setIsPolling(false);
        return;
      }
    }

    setIsPolling(false);
    setIsLoading(false);

    const downloadLink = currentOperation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      // The API key is appended for authentication
      const finalUrl = `${downloadLink}&key=${process.env.API_KEY}`;
      setVideoUrl(finalUrl);
    } else {
      setError('Video generation completed, but no video URL was found.');
    }
  }, []);


  const generateVideo = useCallback(async (prompt: string, imageFile: File | null, aspectRatio: '16:9' | '9:16') => {
    if (!hasApiKey) {
        setError("API Key is required for video generation.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        let imagePayload = undefined;
        if (imageFile) {
            const base64Image = await fileToBase64(imageFile);
            imagePayload = {
                imageBytes: base64Image,
                mimeType: imageFile.type,
            };
        }
        
        const operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            image: imagePayload,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });
        
        await pollOperation(operation, ai);

    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
          setError("API Key not found or invalid. Please select your key again.");
          setHasApiKey(false); // Reset key state
      } else {
          setError(`Error generating video: ${e.message}`);
      }
      setIsLoading(false);
      setIsPolling(false);
    }
  }, [hasApiKey, pollOperation]);

  return {
    isLoading,
    isPolling,
    videoUrl,
    error,
    generateVideo,
    hasApiKey,
    handleSelectKey,
    isCheckingKey,
  };
};
