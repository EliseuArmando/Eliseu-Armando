import React, { useState, useRef } from 'react';
import { Video, Loader2, Download, Film } from 'lucide-react';
import { generateVeoVideo } from '../services/geminiService';
import { ApiKeySelector } from '../components/ApiKeySelector';
import { VeoConfig } from '../types';

export const PropagandaVideo: React.FC = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<VeoConfig>({ aspectRatio: '16:9', resolution: '1080p' });
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Strip prefix for API
        setImage(base64.split(',')[1]);
        setVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setLoading(true);
    setVideoUrl(null);
    try {
      const url = await generateVeoVideo(image, mimeType, prompt, config);
      setVideoUrl(url);
    } catch (e) {
      console.error(e);
      alert("Propaganda generation failed. Please verify your API key and quota.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return <ApiKeySelector onKeySelected={() => setHasAccess(true)} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* INPUT COLUMN */}
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex flex-col gap-6">
            <h2 className="text-xl font-serif text-gray-200 border-b border-white/10 pb-4 flex items-center gap-2">
                <Video className="text-yellow-600" size={20}/>
                Input Source
            </h2>
            
            {/* Image Upload Area */}
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600/50 hover:bg-white/5 transition-all relative overflow-hidden group"
             >
                {image ? (
                   <div className="relative w-full h-full">
                       <img src={`data:${mimeType};base64,${image}`} alt="Source" className="w-full h-full object-contain opacity-60" />
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="bg-black/70 px-3 py-1 rounded text-xs text-white">Change Source Image</span>
                       </div>
                   </div>
                ) : (
                    <div className="text-center p-4">
                        <Film className="mx-auto text-gray-500 mb-2" />
                        <p className="text-gray-400">Upload Image Frame</p>
                    </div>
                )}
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
            </div>

            {/* Configuration Controls */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Format</label>
                     <select 
                       className="w-full bg-black border border-gray-800 text-gray-200 rounded p-3 focus:border-yellow-600 outline-none"
                       value={config.aspectRatio}
                       onChange={(e) => setConfig({ ...config, aspectRatio: e.target.value as any })}
                     >
                       <option value="16:9">Landscape (16:9)</option>
                       <option value="9:16">Portrait (9:16)</option>
                     </select>
                </div>
                <div>
                     <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Quality</label>
                     <select 
                       className="w-full bg-black border border-gray-800 text-gray-200 rounded p-3 focus:border-yellow-600 outline-none"
                       value={config.resolution}
                       onChange={(e) => setConfig({ ...config, resolution: e.target.value as any })}
                     >
                       <option value="720p">720p (Fast)</option>
                       <option value="1080p">1080p (HD)</option>
                     </select>
                </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Directive</label>
              <textarea 
                  placeholder="Describe the movement: e.g., 'A slow, dramatic zoom in on the subject with cinematic lighting.'"
                  className="w-full bg-black border border-gray-800 rounded-lg p-4 text-white focus:border-yellow-600 outline-none min-h-[100px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!image || loading}
              className={`w-full py-4 rounded-lg font-serif font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                  loading 
                    ? 'bg-red-900/30 text-red-400 cursor-wait' 
                    : !image 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-red-900 hover:bg-red-800 text-white shadow-lg shadow-red-900/20'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Film />}
              {loading ? "FABRICATING..." : "GENERATE PROPAGANDA"}
            </button>
        </div>

        {/* OUTPUT COLUMN */}
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex flex-col gap-6 justify-center items-center relative min-h-[400px]">
            {videoUrl ? (
                <div className="w-full h-full flex flex-col gap-4 animate-fade-in">
                    <h2 className="text-xl font-serif text-gray-200 border-b border-white/10 pb-4">Output Footage</h2>
                    <div className="relative rounded-lg overflow-hidden border border-yellow-600/30 shadow-2xl bg-black">
                        <video src={videoUrl} controls autoPlay loop className="w-full h-auto" />
                    </div>
                    <div className="flex justify-end">
                      <a 
                          href={videoUrl}
                          download="propaganda_output.mp4"
                          className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 text-sm font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                      >
                          <Download size={16} /> Download Video
                      </a>
                    </div>
                </div>
            ) : (
                <div className="text-center opacity-30">
                    <Video size={64} className="mx-auto mb-4 text-gray-500" />
                    <p className="font-serif text-xl text-gray-500">Awaiting Footage</p>
                    <p className="text-sm text-gray-600 mt-2">Upload an image to begin generation</p>
                </div>
            )}
        </div>
    </div>
  );
};