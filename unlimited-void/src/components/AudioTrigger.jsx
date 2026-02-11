import { useEffect, useState, useRef } from 'react';

function AudioTrigger({ onTrigger }) {
  const [status, setStatus] = useState('Initializing...');
  const [volume, setVolume] = useState(0);
  const [errorDetails, setErrorDetails] = useState('');
  const audioContextRef = useRef(null);

  useEffect(() => {
    let stream = null;
    let rafId = null;

    const startListening = async () => {
      try {
        setStatus('Requesting microphone permission...');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStatus('Microphone access granted!');

        // Create or resume audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();

        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('AudioContext resumed');
        }

        setStatus('Setting up audio analysis... Listening!');

        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.1; // faster response

        const source = audioContextRef.current.createMediaStreamSource(stream);
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

          // Higher threshold to require actual speech/loud sound - not background noise
          // Adjust this value: 20 = very sensitive, 50 = moderate, 80+ = requires shouting
          if (avg > 75) {
            console.log('Detected loud sound! Avg volume:', avg);
            onTrigger();
            return; // stop after first trigger
          }

          rafId = requestAnimationFrame(checkVolume);
        };

        checkVolume();

      } catch (err) {
        console.error('Audio setup failed:', err.name, err.message);
        setErrorDetails(`${err.name}: ${err.message}`);
        if (err.name === 'NotAllowedError') {
          setStatus('Permission denied. Allow mic in browser/site settings.');
        } else if (err.name === 'NotFoundError') {
          setStatus('No microphone detected on this device.');
        } else {
          setStatus('Failed to start audio.');
        }
      }
    };

    startListening();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [onTrigger]);

  return (
    <div className="mt-8 text-center px-4">
      <p className="text-xl font-semibold text-yellow-300 mb-3">{status}</p>
      
      {volume > 0 && (
        <p className="text-lg">
          Live volume: <span className="font-bold text-green-400">{volume}</span> / 255
          <br />
          <small>(Clap/shout/tap mic → watch this number rise)</small>
        </p>
      )}

      {errorDetails && (
        <p className="text-red-400 mt-4 text-sm">
          Error details: {errorDetails}
          <br />
          Try refreshing or checking mic settings.
        </p>
      )}

      <p className="text-sm mt-6 opacity-80">
        If volume stays at 0 forever → mic not picking up sound or browser blocking.
      </p>
    </div>
  );
}

export default AudioTrigger;