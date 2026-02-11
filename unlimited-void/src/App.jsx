import { useState } from 'react';
import InitialScreen from './components/InitialScreen';
import VoidAnimation from './components/VoidAnimation';
import AudioTrigger from './components/AudioTrigger';
import './index.css';

function App() {
  const [phase, setPhase] = useState('initial'); // 'initial' | 'video' | 'static'

  const activateVoid = () => {
    console.log('✨ DOMAIN EXPANSION ACTIVATED ✨');
    setPhase('video');
    
    // After video duration (adjust to your video length), switch to static
    // 21 seconds allows time for full animation + loop
    setTimeout(() => {
      console.log('📊 Switching to static phase');
      setPhase('static');
    }, 21000); // Adjust based on your video length
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center relative">
      {phase === 'initial' && (
        <>
          <InitialScreen />
          <AudioTrigger onTrigger={activateVoid} />
        </>
      )}

      {(phase === 'video' || phase === 'static') && (
        <VoidAnimation phase={phase} />
      )}
    </div>
  );
}

export default App;