import React, { useState, useRef, useEffect } from "react";

const VoiceAssistant = ({ onTranscript, onResponse }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Audio recording not supported in this browser");
    }
  }, []);

  const startListening = async () => {
    try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      await processAudio(audioBlob);
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorder.start();
    setIsListening(true);
    } catch (err) {
    console.error("Mic error:", err);
    alert("Microphone access error.");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob) => {
    setTimeout(() => {
      const mockTranscript = "Voice recorded successfully ⚡";
      setTranscript(mockTranscript);
      if (onTranscript) onTranscript(mockTranscript);
      setIsProcessing(false);
    }, 1200);
  };

  const handleClick = () => {
    if (isListening) stopListening();
    else if (!isProcessing) startListening();
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex items-center justify-center
        w-16 h-16 rounded-full cursor-pointer
        
        ${isListening ? "scale-110" : "hover:scale-105"}
        ${isProcessing ? "opacity-80" : ""}
      `}
    >
      <img
        src="/batPika.png"
        alt="BatPika"
        className="w-40 h-40 object-contain"
      />
    </div>
  );
};

export default VoiceAssistant;