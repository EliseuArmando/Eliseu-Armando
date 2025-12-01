import React, { useState } from 'react';
import { Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import { generateProImage } from '../services/geminiService';
import { ApiKeySelector } from '../components/ApiKeySelector';
import { ProImageConfig } from '../types';

export const AssetForge: React.FC = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<ProImageConfig>({ size: '1K', aspectRatio: '1:1' });
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setImageUrl(null);
    try {
      const url = await generateProImage(prompt, config);
      setImageUrl(url);
    } catch (e) {
      console.error(e);
      alert("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return <ApiKeySelector onKeySelected={() => setHasAccess(true)} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-white">The Forge</h2>
          <p className="text-gray-400 text-xs">Gemini 3 Turbo Image Generation</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-black border border-gray-700 text-white text-sm rounded px-3 py-2"
            value={config.size}
            onChange={(e) => setConfig({...config, size: e.target.value as any})}
          >
            <option value="1K">1K</option>
            <option value="2K">2K</option>
            <option value="4K">4K</option>
          </select>
          <select 
            className="bg-black border border-gray-700 text-white text-sm rounded px-3 py-2"
            value={config.aspectRatio}
            onChange={(e) => setConfig({...config, aspectRatio: e.target.value as any})}
          >
            <option value="1:1">Square 1:1</option>
            <option value="16:9">Wide 16:9</option>
            <option value="9:16">Tall 9:16</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the asset to forge..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 text-white focus:border-yellow-500 outline-none"
        />
        <button 
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
          Forge
        </button>
      </div>

      <div className="bg-black/40 min-h-[400px] rounded-xl border border-white/5 flex items-center justify-center">
        {imageUrl ? (
          <div className="relative group">
            <img src={imageUrl} alt="Forged Asset" className="max-w-full max-h-[600px] shadow-2xl" />
            <a href={imageUrl} download="forged_asset.png" className="absolute bottom-4 right-4 bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Download />
            </a>
          </div>
        ) : (
          <div className="text-gray-600 font-serif">Empty Canvas</div>
        )}
      </div>
    </div>
  );
};