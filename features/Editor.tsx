import React, { useState, useRef } from 'react';
import { Upload, Wand2, Download, AlertTriangle } from 'lucide-react';
import { editImage } from '../services/geminiService';

export const Editor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        setImage(base64.split(',')[1]);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    setError(null);
    try {
      const newImg = await editImage(image, mimeType, prompt);
      setResult(newImg);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Image edit failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-white mb-2">Visual Manipulation</h2>
        <p className="text-gray-400">Alter reality to suit your narrative using Gemini 2.5 Flash.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border border-white/10 bg-white/5 rounded-lg h-48 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
          >
            {previewUrl ? (
              <img src={previewUrl} className="h-full object-contain p-2" alt="Original" />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Upload size={24} className="mb-2" />
                <span>Select Source Image</span>
              </div>
            )}
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">Command</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Add a retro filter', 'Remove the person in background', 'Make the sky stormy'"
              className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-yellow-600 outline-none h-32"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 p-3 rounded text-red-200 text-sm flex gap-2 items-start">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleEdit}
            disabled={!image || !prompt || loading}
            className={`w-full py-3 rounded font-serif font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${
              loading 
                ? 'bg-yellow-900/30 text-yellow-600' 
                : 'bg-yellow-700 hover:bg-yellow-600 text-black'
            }`}
          >
            {loading ? (
              <>
                <Wand2 className="animate-spin" size={18} />
                <span>Manipulating...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Execute Edit</span>
              </>
            )}
          </button>
        </div>

        {/* Result */}
        <div className="bg-black border border-white/10 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
          {result ? (
            <div className="relative w-full h-full flex items-center justify-center group animate-fade-in">
              <img src={result} alt="Edited" className="max-w-full max-h-[500px] object-contain" />
              <a
                href={result}
                download="edited_image.png"
                className="absolute bottom-4 right-4 bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download size={20} />
              </a>
            </div>
          ) : error ? (
            <div className="text-red-500 font-serif text-center px-4">
               <AlertTriangle className="mx-auto mb-2 opacity-50" size={32} />
               <p className="text-lg">Generation Failed</p>
               <p className="text-xs text-red-400 mt-1 opacity-70">Try a different command or image</p>
            </div>
          ) : (
            <div className="text-gray-700 font-serif text-2xl opacity-20">
              Awaiting Result
            </div>
          )}
        </div>
      </div>
    </div>
  );
};