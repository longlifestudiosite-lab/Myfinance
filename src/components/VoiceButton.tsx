"use client";

import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceButton({ isListening, onStart, onStop }: VoiceButtonProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 flex justify-center z-[9998] pointer-events-none">
      <button
        onClick={isListening ? onStop : onStart}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 pointer-events-auto
          ${
            isListening
              ? "bg-red-600 animate-pulse shadow-red-900/50"
              : "bg-emerald-600 shadow-emerald-900/50 hover:bg-emerald-500"
          }`}
        aria-label={isListening ? "Parar gravação" : "Iniciar comando de voz"}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
