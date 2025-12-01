import React, { useState, useRef } from 'react';
import { Upload, ArrowRight, Sparkles, Download } from 'lucide-react';
import { generateMachiavellianCreative } from '../services/geminiService';

export const Strategist: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [copy, setCopy] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ headline: string; strategy: string; finalImage: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Strip prefix for API
        const data = base64.split(',')[1];
        setImage(data);
        // Reset results
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!image || !copy) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await generateMachiavellianCreative(image, mimeType, copy);
      setResult(res);
    } catch (e) {
      console.error(e);
      alert("Creation failed. Ensure your API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Column */}
      <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex flex-col gap-6">
        <h2 className="text-xl font-serif text-gray-200 border-b border-white/10 pb-4">
          1. Raw Materials
        </h2>
        
        {/* Image Upload */}
        <div 
          className="border-2 border-dashed border-gray-700 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600/50 hover:bg-white/5 transition-all relative overflow-hidden group"
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <>
              <img 
                src={`data:${mimeType};base64,${image}`} 
                alt="Upload" 
                className="w-full h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity" 
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="bg-black/70 px-3 py-1 rounded text-xs text-white">Click to change</span>
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              <Upload className="mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400">Upload Product / Scene</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>

        {/* Copy Input */}
        <div className="flex-grow flex flex-col">
          <label className="text-sm text-gray-400 mb-2">Draft Idea / Copy</label>
          <textarea
            className="w-full bg-black border border-gray-800 rounded-lg p-4 text-white focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 outline-none flex-grow min-h-[100px]"
            placeholder="e.g. 'This perfume makes you irresistible' or 'Buy this watch to look rich'"
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!image || !copy || loading}
          className={`w-full py-5 rounded-lg font-serif font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
            !image || !copy 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : loading 
                ? 'bg-yellow-900/50 text-yellow-200 animate-pulse' 
                : 'bg-gradient-to-r from-yellow-700 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-500 shadow-lg shadow-yellow-900/20'
          }`}
        >
          {loading ? (
            <>
              <Sparkles className="animate-spin" size={18} />
              <span>FORGING CREATIVE...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>GENERATE FINAL AD</span>
            </>
          )}
        </button>
      </div>

      {/* Output Column */}
      <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex flex-col gap-6">
        <h2 className="text-xl font-serif text-gray-200 border-b border-white/10 pb-4">
          2. The Masterpiece
        </h2>

        {result ? (
          <div className="space-y-6 animate-fade-in flex flex-col h-full">
            
            {/* Generated Image Result - Prominent */}
            <div className="relative rounded-xl overflow-hidden border-2 border-yellow-600/50 shadow-[0_0_30px_rgba(234,179,8,0.1)] flex-grow flex items-center justify-center bg-black">
              <img src={result.finalImage} alt="Machiavellian Creative" className="w-full h-auto max-h-[500px] object-contain" />
              <div className="absolute top-4 right-4">
                 <a 
                    href={result.finalImage} 
                    download="machiavellian_creative.png"
                    className="bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors flex items-center justify-center border border-white/20"
                    title="Download High Res"
                  >
                    <Download size={20} />
                  </a>
              </div>
            </div>

            {/* Strategy / Logic */}
            <div className="bg-black/40 border-l-2 border-yellow-600 p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-yellow-600 uppercase tracking-wider font-bold">The Strategy</span>
              </div>
              <p className="text-gray-400 text-sm italic mb-2">
                "{result.strategy}"
              </p>
              <div className="text-white font-serif text-lg">
                headline: <span className="text-yellow-500">"{result.headline}"</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-700 space-y-4 border border-dashed border-gray-800 rounded-xl">
             <Sparkles size={48} className="opacity-20" />
             <p className="font-serif italic text-lg">"The end result will justify the means."</p>
             <p className="text-sm">Upload an image and copy to generate the full creative.</p>
          </div>
        )}
      </div>
    </div>
  );
};