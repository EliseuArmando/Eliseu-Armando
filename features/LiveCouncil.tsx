import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Power } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// Audio Helpers (from Guidelines)
function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return {
    data: btoa(binary),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const LiveCouncil: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [volume, setVolume] = useState(0);

  // Refs for audio context and session
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current.then(s => s.close());
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setStatus('disconnected');
    setVolume(0);
  };

  const connect = async () => {
    try {
      setStatus('connecting');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Session Opened");
            setStatus('connected');
            setIsActive(true);

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume visualization
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolume(Math.sqrt(sum / inputData.length) * 100);

              const blob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: blob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputContextRef.current;
              if (!ctx) return;

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(audioData),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => {
             console.log("Session Closed");
             setStatus('disconnected');
             setIsActive(false);
          },
          onerror: (err) => {
            console.error("Session Error", err);
            setStatus('disconnected');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } // Deep, authoritative voice
          },
          systemInstruction: "You are a Machiavellian strategist advising a Prince. Be succinct, strategic, cunning, and focused on power dynamics. Speak with authority."
        }
      });

      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      alert("Failed to connect to Council.");
      disconnect();
    }
  };

  useEffect(() => {
    return () => disconnect();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white mb-2">The War Room</h2>
        <p className="text-gray-400">Consult the Strategist (Live Audio)</p>
      </div>

      <div className={`relative w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
        status === 'connected' ? 'border-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.3)]' : 'border-gray-800'
      }`}>
        {/* Visualizer Ring */}
        {status === 'connected' && (
          <div 
            className="absolute inset-0 rounded-full bg-yellow-900/30 transition-transform duration-75"
            style={{ transform: `scale(${1 + volume / 50})` }}
          />
        )}
        
        <button
          onClick={isActive ? disconnect : connect}
          className={`z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isActive ? 'bg-red-900 hover:bg-red-800 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
          }`}
        >
          {status === 'connecting' ? (
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
          ) : isActive ? (
            <MicOff size={48} />
          ) : (
            <Power size={48} />
          )}
        </button>
      </div>

      <div className="h-8">
        {status === 'connected' && (
          <span className="text-yellow-500 text-sm tracking-widest uppercase animate-pulse">
            Secure Line Active
          </span>
        )}
      </div>
    </div>
  );
};