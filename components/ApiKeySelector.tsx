import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
      const selected = await win.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        onKeySelected();
      }
    }
    setChecking(false);
  };

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      // Race condition mitigation: assume success after trigger
      win.aistudio.openSelectKey();
      setHasKey(true);
      onKeySelected();
    } else {
      alert("AI Studio environment not detected. Please run in the appropriate environment.");
    }
  };

  if (checking) return <div className="text-center p-4 text-gray-500">Verifying credentials...</div>;
  if (hasKey) return null;

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 text-center max-w-2xl mx-auto my-8">
      <Key className="mx-auto text-yellow-500 mb-4" size={48} />
      <h3 className="text-xl font-serif text-yellow-500 mb-2">Access Required</h3>
      <p className="text-gray-300 mb-6">
        To access the advanced generative capabilities (High-Res Image & Veo Video), 
        you must select a billing-enabled project.
      </p>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleSelectKey}
          className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all"
        >
          Select Access Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-400 underline"
        >
          View Billing Documentation
        </a>
      </div>
    </div>
  );
};