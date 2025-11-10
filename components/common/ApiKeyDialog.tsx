
import React from 'react';
import { Button } from './Button';

interface ApiKeyDialogProps {
  onSelectKey: () => void;
  isCheckingKey: boolean;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onSelectKey, isCheckingKey }) => {
  return (
    <div className="bg-yellow-900/20 border border-yellow-600/50 text-yellow-200 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-2">API Key Required</h3>
      <p className="text-sm mb-4">
        Video generation with Veo requires a Gemini API key with billing enabled. Please select your key to continue.
        For more information, visit the{' '}
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline text-indigo-300 hover:text-indigo-200"
        >
          billing documentation
        </a>.
      </p>
      <Button onClick={onSelectKey} isLoading={isCheckingKey}>
        Select API Key
      </Button>
    </div>
  );
};
