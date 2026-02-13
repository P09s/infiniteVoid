import { useState } from 'react';
import InitialScreen from './components/InitialScreen';
import VoidAnimation from './components/VoidAnimation';
import AudioTrigger from './components/AudioTrigger';
import './index.css';

function App() {
  const [phase, setPhase] = useState('initial'); // 'initial' | 'audio' | 'video' | 'static'
  const [permissionGranted, setPermissionGranted] = useState(false);

  const handlePermissionGranted = () => {
    console.log('✅ Permission granted, initializing audio');
    setPermissionGranted(true);
  };

  const activateVoid = () => {
    console.log('✨ DOMAIN EXPANSION ACTIVATED ✨');
    setPhase('video');
    
    // After video duration, switch to static
    // Adjust this based on your actual video length
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
            <AudioTrigger onTrigger={activateVoid} isEnabled={true} />
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