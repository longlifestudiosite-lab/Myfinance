"use client";

import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceButton({ isListening, onStart, onStop }: VoiceButtonProps) {
  return (
    <button
      onClick={isListening ? onStop : onStart}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full 
        flex items-center justify-center shadow-lg transition-all active:scale-95
        ${
          isListening
            ? "bg-red-500 animate-pulse shadow-red-200"
            : "bg-primary-600 shadow-primary-200 hover:bg-primary-700"
        }`}
      aria-label={isListening ? "Parar gravação" : "Iniciar comando de voz"}
    >
      {isListening ? (
        <MicOff className="w-7 h-7 text-white" />
      ) : (
        <Mic className="w-7 h-7 text-white" />
      )}
    </button>
  );
}
