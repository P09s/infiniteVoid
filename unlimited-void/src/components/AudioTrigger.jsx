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
  const isInitializedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const permissionRequestedRef = useRef(false); // NEW: Track if we already asked

  const keywordsRef = useRef([
    'ryoiki tenkai', 
    'domain expansion', 
    'unlimited void', 
    'ryoki tenkai',
    'tenkai', 
    'expansion',
    'void',
    'rioki',
    'tenka',
    'ten',
    'muryokusho',
    'muryo',
    'kusho',
    'moriya',
    'khush',
    'ho',
    'morya kusa'
  ]);

  // EFFECT 1: One-time setup of Web Speech API (run once on mount)
  useEffect(() => {
    console.log('🚀 AudioTrigger mounting...');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ Web Speech API not supported');
      setStatus('Speech recognition not supported');
      return;
    }

    console.log('✅ Web Speech API available');

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
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          console.log('📝 Final result:', transcript);
          setDetectedText(transcript);

          const foundKeyword = keywordsRef.current.some(keyword => 
            transcript.includes(keyword)
          );

          if (foundKeyword && !hasTriggeredRef.current) {
            console.log('✨✨✨ KEYWORD DETECTED:', transcript);
            hasTriggeredRef.current = true;
            onTrigger();
          }
        } else {
          interimTranscript += transcript;
          console.log('🔤 Interim:', transcript);
          setDetectedText(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Recognition error:', event.error);
      setErrorDetails(`Error: ${event.error}`);

      if (event.error === 'no-speech') {
        setStatus('🎤 No speech, listening...');
      } else if (event.error === 'audio-capture') {
        setStatus('❌ Microphone not found');
      } else if (event.error === 'network') {
        setStatus('❌ Network error');
      }
    };

    recognition.onend = () => {
      console.log('🛑 Recognition ended');
      
      if (isEnabled && !hasTriggeredRef.current) {
        console.log('🔄 Restarting...');
        try {
          recognition.start();
        } catch (err) {
          console.log('Restart error:', err.message);
        }
      }
    };

    console.log('✅ Recognition instance configured');

    return () => {
      console.log('🧹 Cleaning up recognition...');
      try {
        recognition.abort();
      } catch (err) {
        console.log('Cleanup error:', err);
      }
    };
  }, []);

  // EFFECT 2: Handle isEnabled changes - REQUEST PERMISSION ONLY ONCE
  useEffect(() => {
    if (!recognitionRef.current) {
      console.log('⚠️ Recognition not ready yet');
      return;
    }

    if (isEnabled) {
      if (isInitializedRef.current) {
        console.log('✅ Already listening, not requesting permission again');
        return;
      }

      // CRITICAL: Only request permission if we haven't already
      if (permissionRequestedRef.current) {
        console.log('⚠️ Permission already requested, waiting for result...');
        return;
      }

      console.log('🎯 Requesting permission for first time...');
      permissionRequestedRef.current = true; // Mark that we asked

      const startListening = async () => {
        try {
          setStatus('🎤 Requesting microphone...');

          const constraints = {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          };

          // CRITICAL: This should only be called ONCE
          console.log('📞 Calling getUserMedia...');
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          console.log('✅ Microphone stream obtained');

          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContext();
          
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          audioContextRef.current = audioContext;

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
            const newVolume = Math.round(sum / bufferLength);
            setVolume(newVolume);
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };

          checkVolume();

          // Start recognition
          try {
            recognitionRef.current.start();
            console.log('✅ Recognition started');
            isInitializedRef.current = true;
          } catch (err) {
            if (err.name === 'InvalidStateError') {
              console.log('⚠️ Recognition already running');
              isInitializedRef.current = true;
            } else {
              throw err;
            }
          }

        } catch (err) {
          console.error('❌ Start error:', err.name, err.message);
          setErrorDetails(`${err.name}: ${err.message}`);
          setStatus('❌ Error');
          // Reset the flag so user can try again
          permissionRequestedRef.current = false;
        }
      };

      startListening();

    } else {
      console.log('⏸️ Stopping speech recognition...');

      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.log('Abort error:', err);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (err) {
          console.log('Context close error:', err);
        }
      }

      isInitializedRef.current = false;
      hasTriggeredRef.current = false;
      permissionRequestedRef.current = false; // Reset permission flag
      console.log('🛑 Stopped');
    }

  }, [isEnabled]);

  return (
    <div className="mt-8 text-center px-4 max-w-2xl mx-auto">
      <p className="text-xl font-semibold text-yellow-300 mb-3">{status}</p>
      
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
      <p className="text-[10px] opacity-50 mb-6">
        Mic Sensitivity: {volume} {volume > 20 ? '✓' : ''}
      </p>

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