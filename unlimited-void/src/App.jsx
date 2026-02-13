import { useState } from 'react';
import InitialScreen from './components/InitialScreen';
import VoidAnimation from './components/VoidAnimation';
import AudioTrigger from './components/AudioTrigger';
import './index.css';

function App() {
  const [phase, setPhase] = useState('initial'); // 'initial' | 'audio' | 'video' | 'static'
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [audioStream, setAudioStream] = useState(null); // NEW: Store stream

  // Updated to accept stream
  const handlePermissionGranted = (stream) => {
    console.log('✅ Permission granted, initializing audio');
    setAudioStream(stream); // Store it
    setPermissionGranted(true);
  };

  const activateVoid = () => {
    console.log('✨ DOMAIN EXPANSION ACTIVATED ✨');
    
    // Stop the mic when we enter the void
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
    }

    setPhase('video');
    
    setTimeout(() => {
      console.log('🔊 Switching to static phase');
      setPhase('static');
    }, 21000);
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center relative">
      {phase === 'initial' && (
        <>
          <InitialScreen onPermissionGranted={handlePermissionGranted} />
          {permissionGranted && (
            <AudioTrigger 
                onTrigger={activateVoid} 
                isEnabled={true} 
                existingStream={audioStream} // Pass it down
            />
          )}
        </>
      )}

      {(phase === 'video' || phase === 'static') && (
        <VoidAnimation phase={phase} />
      )}
    </div>
  );
}

export default App;