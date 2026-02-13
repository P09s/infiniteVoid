import { useEffect, useState, useRef } from 'react';

function AudioTrigger({ onTrigger, isEnabled }) {
  const [status, setStatus] = useState('Ready to listen...');
  const [volume, setVolume] = useState(0);
  const [errorDetails, setErrorDetails] = useState('');
  const [detectedText, setDetectedText] = useState('');
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Detect mobile to prevent conflict
  const isMobileRef = useRef(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

  const keywordsRef = useRef([
    'ryoiki tenkai', 'domain expansion', 'unlimited void', 
    'ryoki', 'tenkai', 'expansion', 'void', 'muryokusho'
  ]);

  // EFFECT 1: Setup Speech Recognition
  useEffect(() => {
    // 1. Check Browser Support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('⚠️ Speech API not supported on this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    recognition.onstart = () => {
      console.log('🎙️ Recognition started');
      setStatus('🎤 Listening for "Ryoiki Tenkai"...');
      // If on mobile, start a "fake" visualizer so UI looks active
      if (isMobileRef.current) startFakeVisualizer();
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (event.results[i].isFinal) {
          console.log('📝 Final:', transcript);
          setDetectedText(transcript);
          const found = keywordsRef.current.some(k => transcript.includes(k));
          if (found && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onTrigger();
          }
        } else {
          setDetectedText(transcript); // Show interim text
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Error:', event.error);
      if (event.error !== 'no-speech') {
        setStatus(`❌ Retry: ${event.error}`);
        // Auto-restart on some mobile errors
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
             setErrorDetails('Microphone blocked. Check site permissions.');
        }
      }
    };

    recognition.onend = () => {
      if (isEnabled && !hasTriggeredRef.current) {
        console.log('🔄 Restarting recognition...');
        try { recognition.start(); } catch (e) { console.log(e); }
      }
    };

    return () => {
      try { recognition.abort(); } catch(e) {}
    };
  }, []);

  // EFFECT 2: Manage Audio (Split logic for Mobile vs Desktop)
  useEffect(() => {
    if (!isEnabled || !recognitionRef.current) return;

    const startAudio = async () => {
      try {
        // --- MOBILE FIX: SKIP getUserMedia ---
        if (isMobileRef.current) {
          console.log('📱 Mobile detected: Skipping Visualizer to prevent conflict');
          // Just start recognition directly
          try {
             recognitionRef.current.start();
          } catch(e) { console.log('Already started'); }
          return; 
        }

        // --- DESKTOP: RUN BOTH ---
        console.log('🖥️ Desktop detected: Enabling Visualizer');
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: true, noiseSuppression: true } 
        });
        streamRef.current = stream;

        // Setup Visualizer
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          const vol = Math.round(dataArray.reduce((a, b) => a + b) / dataArray.length);
          setVolume(vol);
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();

        // Start Recognition
        try { recognitionRef.current.start(); } catch(e) {}

      } catch (err) {
        console.error('Start error:', err);
        // Fallback: If visualizer fails, still try to run recognition
        try { recognitionRef.current.start(); } catch(e) {}
      }
    };

    startAudio();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isEnabled]);

  // Helper for mobile "Fake" visualizer
  const startFakeVisualizer = () => {
    const update = () => {
      // Create a gentle random movement
      setVolume(Math.random() * 30 + 10); 
      if (!hasTriggeredRef.current) requestAnimationFrame(update);
    };
    update();
  };

  return (
    <div className="mt-8 text-center px-4 max-w-2xl mx-auto">
      <p className="text-xl font-semibold text-yellow-300 mb-3">{status}</p>
      
      {detectedText && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
          <p className="text-xs opacity-60 uppercase tracking-widest mb-1">Detected Speech</p>
          <p className="text-lg text-cyan-300 animate-pulse font-mono">"{detectedText}"</p>
        </div>
      )}

      {/* Volume Visualizer */}
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-75"
          style={{ width: `${Math.min(volume * 2, 100)}%` }}
        />
      </div>
      <p className="text-[10px] opacity-50 mb-6">
        Mic Sensitivity: {Math.round(volume)} {isMobileRef.current ? '(Mobile Mode)' : ''}
      </p>

      <p className="text-sm opacity-80">
        <strong>Keywords:</strong> "Ryoiki Tenkai" • "Domain Expansion"
      </p>

      {errorDetails && (
        <div className="mt-6 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
          {errorDetails}
        </div>
      )}
    </div>
  );
}

export default AudioTrigger;