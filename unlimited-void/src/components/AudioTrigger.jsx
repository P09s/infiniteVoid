import { useEffect, useState, useRef } from 'react';

function AudioTrigger({ onTrigger }) {
  const [status, setStatus] = useState('Initializing...');
  const [volume, setVolume] = useState(0);
  const [errorDetails, setErrorDetails] = useState('');
  const [detectedText, setDetectedText] = useState('');
  const audioContextRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const streamRef = useRef(null);

  // Keywords to detect
  const KEYWORDS = ['ryoiki tenkai', 'domain expansion', 'unlimited void'];

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
      
      // Chrome fix: Enumerate devices first to warm up the system
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        console.log('Found audio devices:', audioDevices.length);
        
        if (audioDevices.length === 0) {
          setStatus('❌ No microphone detected');
          setErrorDetails('Connect a microphone and refresh the page');
          return;
        }
      } catch (enumErr) {
        console.warn('Could not enumerate devices, continuing anyway:', enumErr);
      }

      // Request microphone with specific constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to basic audio request
        console.warn('Detailed constraints failed, trying basic:', err);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;
      setStatus('✅ Microphone access granted!');

      // Setup audio context for volume visualization
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      audioContextRef.current = audioContext;

      // Create voice command handlers
      const commands = {};
      
      // Add all keywords as commands
      KEYWORDS.forEach(keyword => {
        commands[keyword] = () => {
          if (!hasTriggeredRef.current) {
            console.log('✨ KEYWORD DETECTED:', keyword);
            hasTriggeredRef.current = true;
            onTrigger();
          }
        };
      });

      // Also capture partial matches with wildcard
      commands['*transcript'] = (transcript) => {
        if (transcript) {
          const lowerTranscript = transcript.toLowerCase().trim();
          setDetectedText(lowerTranscript);

          // Check for keywords in transcript
          KEYWORDS.forEach(keyword => {
            if (lowerTranscript.includes(keyword) && !hasTriggeredRef.current) {
              console.log('✨ KEYWORD DETECTED (partial):', keyword);
              hasTriggeredRef.current = true;
              onTrigger();
            }
          });
        }
      };

      // Set language to Indian English
      window.annyang.setLanguage('en-IN');

      // Add commands
      window.annyang.addCommands(commands);

      // Start recognition with better error handling
      try {
        window.annyang.start({ autoRestart: true, continuous: true });
        setStatus('🎤 Listening for keywords... (Annyang active)');
      } catch (startErr) {
        console.error('Error starting annyang:', startErr);
        setStatus('⚠️ Speech recognition started with issues');
      }

      // Setup volume monitoring with the existing stream
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.1;

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
        const avg = sum / bufferLength;
        setVolume(Math.round(avg));
        requestAnimationFrame(checkVolume);
      };

      checkVolume();

    } catch (err) {
      console.error('Setup failed:', err.name, err.message);
      setErrorDetails(`${err.name}: ${err.message}`);
      
      if (err.name === 'NotFoundError') {
        setStatus('❌ No microphone found');
        setErrorDetails('Check: 1) Microphone plugged in? 2) Permission denied in Chrome settings?');
      } else if (err.name === 'NotAllowedError') {
        setStatus('❌ Microphone permission denied');
        setErrorDetails('Click the lock icon in the URL bar and allow microphone access');
      } else if (err.name === 'NotReadableError') {
        setStatus('❌ Microphone in use by another app');
        setErrorDetails('Close other apps using the microphone (Discord, Zoom, etc.)');
      } else {
        setStatus('❌ Failed to initialize speech recognition');
      }
    }
  };

  return (
    <div className="mt-8 text-center px-4 max-w-2xl mx-auto">
      <p className="text-xl font-semibold text-yellow-300 mb-3">{status}</p>
      
      {detectedText && (
        <p className="text-lg text-cyan-300 mb-3 animate-pulse font-mono">
          Heard: <span className="font-bold text-green-400">"{detectedText}"</span>
        </p>
      )}

      {volume > 0 && (
        <p className="text-lg">
          Live volume: <span className="font-bold text-green-400">{volume}</span> / 255
          <br />
          <small>(Speak louder for better recognition)</small>
        </p>
      )}

      <p className="text-sm mt-6 opacity-80">
        <strong>Keywords to say:</strong>
        <br />
        "Ryoiki Tenkai" • "Domain Expansion" • "Unlimited Void"
      </p>

      {errorDetails && (
        <div className="mt-6 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
          {errorDetails}
          <br />
          <small className="opacity-70 mt-2 block">
            Try: 1) Check microphone in System Settings, 2) Refresh page, 3) Try Safari
          </small>
        </div>
      )}
    </div>
  );
}

export default AudioTrigger;