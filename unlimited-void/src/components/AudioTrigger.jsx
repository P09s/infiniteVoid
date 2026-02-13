import { useEffect, useState, useRef } from 'react';

function AudioTrigger({ onTrigger, isEnabled, existingStream }) {
  const [status, setStatus] = useState('Ready to listen...');
  const [volume, setVolume] = useState(0);
  const [errorDetails, setErrorDetails] = useState('');
  const [detectedText, setDetectedText] = useState('');
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const streamRef = useRef(null);
  const isInitializedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const permissionRequestedRef = useRef(false);

  const keywordsRef = useRef([
    'ryoiki tenkai', 'domain expansion', 'unlimited void', 
    'ryoki tenkai', 'tenkai', 'expansion', 'void',
    'rioki', 'tenka', 'ten', 'muryokusho', 'muryo', 'kusho',
    'moriya', 'khush', 'ho', 'morya kusa'
  ]);

  // EFFECT 1: Web Speech API Setup (Identical to before)
  useEffect(() => {
    console.log('🚀 AudioTrigger mounting...');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ Web Speech API not supported');
      setStatus('Speech recognition not supported');
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
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();

        if (event.results[i].isFinal) {
          console.log('📝 Final result:', transcript);
          setDetectedText(transcript);
          const foundKeyword = keywordsRef.current.some(keyword => transcript.includes(keyword));

          if (foundKeyword && !hasTriggeredRef.current) {
            console.log('✨ KEYWORD DETECTED:', transcript);
            hasTriggeredRef.current = true;
            onTrigger();
          }
        } else {
          interimTranscript += transcript;
          setDetectedText(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setErrorDetails(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('🛑 Recognition ended');
      if (isEnabled && !hasTriggeredRef.current) {
        try { recognition.start(); } catch (err) { console.log('Restart error:', err.message); }
      }
    };

    return () => {
      try { recognition.abort(); } catch (err) {}
    };
  }, []);

  // EFFECT 2: Handle Audio Context & Stream
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isEnabled) {
      if (isInitializedRef.current) return;

      const startListening = async () => {
        try {
          let stream = existingStream;

          // Only request mic if we didn't get one from props
          if (!stream) {
              if (permissionRequestedRef.current) return;
              permissionRequestedRef.current = true;
              console.log('📞 Calling getUserMedia (Fallback)...');
              stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
              });
          } else {
             console.log('✅ Using existing stream from props');
          }
          
          streamRef.current = stream;

          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContext();
          if (audioContext.state === 'suspended') await audioContext.resume();
          audioContextRef.current = audioContext;

          // Visualizer
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            setVolume(Math.round(sum / bufferLength));
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();

          // Start Recognition
          try {
            recognitionRef.current.start();
            isInitializedRef.current = true;
          } catch (err) {
            if (err.name !== 'InvalidStateError') throw err;
            isInitializedRef.current = true;
          }

        } catch (err) {
          console.error('❌ Start error:', err);
          setErrorDetails(`${err.name}: ${err.message}`);
          setStatus('❌ Error');
        }
      };

      startListening();

    } else {
      // Cleanup logic
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      
      // NOTE: We do NOT stop the stream tracks here if they came from props.
      // App.jsx handles stopping them when changing phases.
      
      isInitializedRef.current = false;
      hasTriggeredRef.current = false;
    }
  }, [isEnabled, existingStream]);

  return (
    <div className="mt-8 text-center px-4 max-w-2xl mx-auto">
      <p className="text-xl font-semibold text-yellow-300 mb-3">{status}</p>
      
      {detectedText && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
          <p className="text-xs opacity-60 uppercase tracking-widest mb-1">Detected Speech</p>
          <p className="text-lg text-cyan-300 animate-pulse font-mono">"{detectedText}"</p>
        </div>
      )}

      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-75"
          style={{ width: `${Math.min((volume / 100) * 100, 100)}%` }}
        />
      </div>
      <p className="text-[10px] opacity-50 mb-6">Mic Sensitivity: {volume} {volume > 20 ? '✓' : ''}</p>

      <p className="text-sm opacity-80">
        <strong>Keywords:</strong> "Ryoiki Tenkai" • "Domain Expansion"
      </p>

      {errorDetails && (
        <div className="mt-6 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
          {errorDetails}
        </div>
      )}

      <div className="mt-6 text-xs opacity-60 bg-blue-900/20 border border-blue-700 rounded p-3">
        <p className="mb-2"><strong>💡 Speaking Tips</strong></p>
        <ul className="text-left space-y-1">
          <li>✓ Speak clearly and naturally</li>
          <li>✓ Complete your phrase before pausing</li>
          <li>✓ Volume bar shows microphone input</li>
          <li>✓ Watch console for detected speech</li>
        </ul>
      </div>
    </div>
  );
}
export default AudioTrigger;