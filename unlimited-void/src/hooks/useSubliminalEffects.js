import { useRef } from 'react';

export const useSubliminalEffects = () => {
  const effectsRef = useRef(null);

  // Subliminal Flash Effect
  const triggerSubliminalFlash = (flashType = 'eyes') => {
    if (!effectsRef.current) return; // Safety check
    
    const effectDiv = effectsRef.current;
    effectDiv.classList.add('active');

    // Flash for 200ms only
    setTimeout(() => {
      effectDiv.classList.remove('active');
    }, 200);
  };

  // Hollow Purple Easter Egg
  const triggerHollowPurple = () => {
    if (!effectsRef.current) return; // Safety check

    const effectDiv = effectsRef.current;
    effectDiv.classList.add('hollow-purple-blast');

    setTimeout(() => {
      effectDiv.classList.remove('hollow-purple-blast');
    }, 800);

    // Screen shake effect
    document.body.style.animation = 'screenshake 0.5s';
    setTimeout(() => {
      document.body.style.animation = 'none';
    }, 500);
  };

  return { effectsRef, triggerSubliminalFlash, triggerHollowPurple };
};

// CSS animations for effects
export const effectsCSS = `
  @keyframes screenshake {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(-8px, -8px); }
    50% { transform: translate(8px, 8px); }
    75% { transform: translate(-8px, 8px); }
  }

  @keyframes subliminal-flash {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes purple-blast {
    0% { opacity: 0; background-color: rgba(168, 85, 247, 0.4); }
    40% { opacity: 1; background-color: rgba(168, 85, 247, 0.8); }
    100% { opacity: 1; background-color: rgba(255, 255, 255, 1); }
  }

  @keyframes purple-ring {
    0% { 
      width: 100px; 
      height: 100px; 
      opacity: 1; 
      box-shadow: 0 0 30px rgba(168, 85, 247, 1);
    }
    100% { 
      width: 800px; 
      height: 800px; 
      opacity: 0; 
      box-shadow: 0 0 60px rgba(168, 85, 247, 0.2);
    }
  }

  .effects-container.active {
    animation: subliminal-flash 0.2s ease-out !important;
  }

  .effects-container.hollow-purple-blast {
    animation: purple-blast 0.8s ease-out !important;
  }

  .effects-container.hollow-purple-blast::before {
    content: '';
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border: 3px solid rgba(168, 85, 247, 1);
    border-radius: 50%;
    animation: purple-ring 0.6s ease-out;
    z-index: 9999;
  }

  /* Subliminal image overlay */
  .subliminal-content {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6rem;
    color: rgba(168, 85, 247, 0.9);
    text-shadow: 0 0 20px rgba(168, 85, 247, 1);
    font-weight: bold;
    letter-spacing: 0.2em;
    z-index: 9998;
    pointer-events: none;
  }
`;