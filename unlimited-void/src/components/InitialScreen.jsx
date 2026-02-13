import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import gojoInitial from '../assets/gojo-initial.jpg';

function InitialScreen({ onPermissionGranted }) {
  const [isPreloading, setIsPreloading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied'
  const [error, setError] = useState('');

  // Preload critical assets on mount
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        // Preload images
        const images = [
          new URL('../assets/gojo-initial.jpg', import.meta.url).href,
          new URL('../assets/void-static.png', import.meta.url).href,
          new URL('../assets/channel-logo.jpeg', import.meta.url).href,
        ];

        const videoPath = '/videos/unlimited-void-loop.mp4';

        // Preload images
        await Promise.all(
          images.map(src => 
            new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = reject;
              img.src = src;
            })
          )
        );

        // Preload video
        await new Promise((resolve, reject) => {
          const video = document.createElement('video');
          video.preload = 'auto';
          video.onloadstart = () => {
            // Give it a moment to start downloading
            setTimeout(resolve, 500);
          };
          video.onerror = reject;
          video.src = videoPath;
        });

        setIsPreloading(false);
        console.log('✨ Assets preloaded successfully');
      } catch (err) {
        console.warn('Preload warning:', err);
        // Still proceed even if preload fails
        setIsPreloading(false);
      }
    };

    preloadAssets();
  }, []);

  // Request microphone permission on user interaction (mobile-friendly)
  const handleRequestPermission = async () => {
    setPermissionStatus('requesting');
    setError('');

    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      // This triggers the actual permission prompt
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop all tracks immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());

      setPermissionStatus('granted');
      console.log('✅ Microphone permission granted');

      // Trigger the audio initialization
      setTimeout(() => {
        onPermissionGranted();
      }, 500);

    } catch (err) {
      console.error('Permission error:', err.name);
      setPermissionStatus('denied');
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please enable in browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found on this device.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 bg-cover bg-center flex flex-col items-center justify-center z-10"
      style={{
        backgroundImage: `url(${gojoInitial})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-5xl md:text-7xl font-bold mb-6 text-purple-300 drop-shadow-lg"
        >
          Unlimited Void
        </motion.h1>

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-xl md:text-2xl mb-8"
        >
          {permissionStatus === 'granted' 
            ? 'Speak "Ryoiki Tenkai" to open.'
            : 'Enable microphone to begin.'}
        </motion.p>

        {/* Preload indicator */}
        {isPreloading && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm opacity-70 mb-6"
          >
            Loading assets...
          </motion.div>
        )}

        {/* Permission button - only show if not already granted */}
        {permissionStatus !== 'granted' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            onClick={handleRequestPermission}
            disabled={permissionStatus === 'requesting' || isPreloading}
            className={`px-8 py-3 rounded-lg font-bold text-lg mb-4 transition-all ${
              permissionStatus === 'requesting'
                ? 'bg-yellow-500/50 text-white cursor-wait'
                : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {permissionStatus === 'requesting' ? '🔄 Requesting...' : '🎤 Enable Microphone'}
          </motion.button>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm"
          >
            {error}
          </motion.div>
        )}

        {permissionStatus !== 'granted' && (
          <p className="text-sm opacity-70 mt-6">
            {isPreloading 
              ? '⏳ Please wait while we load everything...'
              : '✅ Ready when you are!'}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default InitialScreen;