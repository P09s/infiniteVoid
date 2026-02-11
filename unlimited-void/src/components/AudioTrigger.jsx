import { useEffect, useState, useRef } from 'react';

function AudioTrigger({ onTrigger }) {
  const [status, setStatus] = useState('Initializing...');
  const [volume, setVolume] = useState(0);
  const [errorDetails, setErrorDetails] = useState('');
  const [detectedText, setDetectedText] = useState('');
  const audioContextRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const streamRef = useRef(null);

  // 1. Expanded keywords to catch phonetic variations on mobile
  const KEYWORDS = [
    'ryoiki tenkai', 
    'domain expansion', 
    'unlimited void', 
    'ryoki tenkai',
    'tenkai', 
    'expansion',
    'void'
  ];

  useEffect(() => {
    // Load Annyang library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/annyang/2.6.1/annyang.min.js';
    script.async = true;
    script.onload = () => {
      initializeAnnyang();
    };
    script.onerror = () => {
      setStatus('Failed to load Annyang library');
      setErrorDetails('Could not load speech recognition library');
    };
    document.head.appendChild(script);

    return () => {
      if (window.annyang) {
        try {
          window.annyang.abort();
        } catch (err) {
          console.log('Error aborting annyang:', err);
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (err) {
          console.log('Error closing audio context:', err);
        }
      }
    };
  }, []);

  const initializeAnnyang = async () => {
    if (!window.annyang) {
      setStatus('Annyang not available');
      return;
    }

    try {
      setStatus('🔒 Requesting microphone permission...');
      
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setStatus('✅ Microphone access granted!');

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      audioContextRef.current = audioContext;

      // 2. Setup commands using a wildcard to catch speech in real-time
      const commands = {
        '*transcript': (transcript) => {
          if (transcript) {
            const lowerTranscript = transcript.toLowerCase().trim();
            setDetectedText(lowerTranscript); // Visual feedback for mobile

            // Check if any keyword exists in the transcript
            const foundKeyword = KEYWORDS.some(keyword => lowerTranscript.includes(keyword));
            
            if (foundKeyword && !hasTriggeredRef.current) {
              console.log('✨ KEYWORD DETECTED:', lowerTranscript);
              hasTriggeredRef.current = true;
              onTrigger();
            }
          }
        }
      };

      // 3. Set language and add a result callback for better mobile debugging
      window.annyang.setLanguage('en-US'); // Standard for Android Speech engines
      window.annyang.addCommands(commands);

      // Explicitly show what the phone is hearing via a callback
      window.annyang.addCallback('result', (userSaid) => {
        if (userSaid && userSaid.length > 0) {
          setDetectedText(userSaid[0].toLowerCase());
        }
      });

      // Start recognition
      window.annyang.start({ autoRestart: true, continuous: true });
      setStatus('🎤 Listening for "Ryoiki Tenkai"...');

      // Setup volume visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        setVolume(Math.round(sum / bufferLength));
        requestAnimationFrame(checkVolume);
      };

      checkVolume();

    } catch (err) {
      console.error('Setup failed:', err.name, err.message);
      setErrorDetails(`${err.name}: ${err.message}`);
      setStatus('❌ Microphone Error');
    }
  };

  return (
    <div className="mt-8 text-center px-4 max-w-2xl mx-auto">
      <p className="text-xl font-semibold text-yellow-300 mb-3">{status}</p>
      
      {/* Real-time feedback helps you see if the phone is hearing you */}
      {detectedText && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
          <p className="text-xs opacity-60 uppercase tracking-widest mb-1">Detected Speech</p>
          <p className="text-lg text-cyan-300 animate-pulse font-mono">
            "{detectedText}"
          </p>
        </div>
      )}

      {/* Volume Visualizer */}
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-75"
          style={{ width: `${Math.min((volume / 100) * 100, 100)}%` }}
        />
      </div>
      <p className="text-[10px] opacity-50 mb-6">Mic Sensitivity: {volume}</p>

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