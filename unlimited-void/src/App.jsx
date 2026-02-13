import { useState } from 'react';
import InitialScreen from './components/InitialScreen';
import VoidAnimation from './components/VoidAnimation';
import AudioTrigger from './components/AudioTrigger';
import MouseTrail from './components/MouseTrail';
import './index.css';

function App() {
  const [phase, setPhase] = useState('initial');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [triggerType, setTriggerType] = useState('normal'); // 'normal' | 'hollowPurple'

  const handlePermissionGranted = (stream) => {
    console.log('✅ Permission granted, initializing audio');
    setAudioStream(stream);
    setPermissionGranted(true);
  };

  const activateVoid = (type = 'normal') => {
    console.log('✨ DOMAIN EXPANSION ACTIVATED ✨');
    console.log('Type:', type);
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }

    setTriggerType(type);
    setPhase('video');
    
    // Switch to static after video ends
    setTimeout(() => {
      console.log('🔊 Switching to static phase');
      setPhase('static');
    }, 21000);
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center relative">
      {/* Mouse Trail - Only visible during initial and audio phases */}
      {(phase === 'initial' || permissionGranted) && <MouseTrail />}

      {phase === 'initial' && (
        <>
          <InitialScreen onPermissionGranted={handlePermissionGranted} />
          {permissionGranted && (
            <AudioTrigger 
              onTrigger={activateVoid}
              isEnabled={true} 
              existingStream={audioStream}
            />
          )}
        </>
      )}

      {(phase === 'video' || phase === 'static') && (
        <VoidAnimation phase={phase} triggerType={triggerType} />
      )}
    </div>
  );
}

export default App;