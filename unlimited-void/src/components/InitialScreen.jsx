import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import gojoInitial from '../assets/gojo-initial.jpg';

function InitialScreen({ onPermissionGranted }) {
  const [isPreloading, setIsPreloading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('idle');
  const [error, setError] = useState('');
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    setIsMobile(mobile);
    console.log('📱 Device type:', mobile ? 'Mobile' : 'Desktop');
  }, []);

  // Preload assets
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        const images = [
          new URL('../assets/gojo-initial.jpg', import.meta.url).href,
          new URL('../assets/void-static.png', import.meta.url).href,
          new URL('../assets/channel-logo.jpeg', import.meta.url).href,
        ];

        const videoPath = '/videos/unlimited-void-loop.mp4';

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

        await new Promise((resolve, reject) => {
          const video = document.createElement('video');
          video.preload = 'auto';
          video.onloadstart = () => setTimeout(resolve, 500);
          video.onerror = reject;
          video.src = videoPath;
        });

        setIsPreloading(false);
        console.log('✨ Assets preloaded');
      } catch (err) {
        console.warn('Preload warning:', err);
        setIsPreloading(false);
      }
    };

    preloadAssets();
  }, []);

  // Request microphone permission
  const handleRequestPermission = async () => {
    setPermissionStatus('requesting');
    setError('');
    setTimeoutWarning(false);

    console.log('🎤 Requesting microphone access...');

    const timeoutId = setTimeout(() => {
      setTimeoutWarning(true);
      console.warn('⚠️ Permission dialog taking longer than expected');
    }, 3000);

    try {
      // Small delay to ensure browser is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      console.log('🔊 Calling getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Stream obtained, stopping tracks...');
      stream.getTracks().forEach(track => {
        console.log('🛑 Stopping track:', track.kind);
        track.stop();
      });

      clearTimeout(timeoutId);
      setPermissionStatus('granted');
      console.log('✅ Permission granted!');

      // Give time for state to update
      setTimeout(() => {
        onPermissionGranted();
      }, 300);

    } catch (err) {
      clearTimeout(timeoutId);
      console.error('❌ Permission error:', err.name, err.message);
      setPermissionStatus('denied');
      
      let userMessage = '';
      
      if (err.name === 'NotAllowedError') {
        userMessage = 'Microphone permission denied. Please allow it to continue.';
      } else if (err.name === 'NotFoundError') {
        userMessage = 'No microphone found on this device.';
      } else if (err.name === 'NotReadableError') {
        userMessage = 'Microphone is being used by another app. Close other apps and try again.';
      } else if (err.name === 'SecurityError') {
        userMessage = 'Permission denied for security reasons. Try using HTTPS or a different browser.';
      } else {
        userMessage = `Error: ${err.message}`;
      }
      
      setError(userMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 bg-cover bg-center flex flex-col items-center justify-center z-10 overflow-y-auto"
      style={{
        backgroundImage: `url(${gojoInitial})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 text-center px-4 max-w-2xl py-8">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-4xl md:text-7xl font-bold mb-4 md:mb-6 text-purple-300 drop-shadow-lg"
        >
          Unlimited Void
        </motion.h1>

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-lg md:text-2xl mb-6 md:mb-8"
        >
          {permissionStatus === 'granted' 
            ? 'Speak "Ryoiki Tenkai" to open.'
            : 'Enable microphone to begin.'}
        </motion.p>

        {/* Loading indicator */}
        {isPreloading && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm opacity-70 mb-6"
          >
            Loading assets...
          </motion.div>
        )}

        {/* Permission button */}
        {permissionStatus !== 'granted' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            onClick={handleRequestPermission}
            disabled={permissionStatus === 'requesting' || isPreloading}
            className={`w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg mb-4 transition-all ${
              permissionStatus === 'requesting'
                ? 'bg-yellow-500 text-white cursor-wait'
                : permissionStatus === 'denied'
                ? 'bg-red-600 text-white cursor-not-allowed opacity-50'
                : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {permissionStatus === 'requesting' ? '🔄 Requesting...' : '🎤 Enable Microphone'}
          </motion.button>
        )}

        {/* Timeout warning */}
        {timeoutWarning && permissionStatus === 'requesting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded text-yellow-200 text-sm mb-4"
          >
            <p className="mb-2">⚠️ Permission dialog taking longer than expected.</p>
            <p className="text-xs mb-3">You should see a popup asking for microphone access.</p>
            {isMobile && (
              <p className="text-xs mb-3">
                <strong>Mobile tip:</strong> Look for a permission dialog at the bottom or top of your screen.
              </p>
            )}
            <button 
              onClick={() => {
                setPermissionStatus('idle');
                setTimeoutWarning(false);
              }}
              className="mt-2 px-4 py-2 bg-yellow-600 rounded text-white text-sm hover:bg-yellow-700"
            >
              ✓ I Allowed Permission
            </button>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm mb-4"
          >
            <p className="font-bold mb-2">❌ {error}</p>
            
            {permissionStatus === 'denied' && !isMobile && (
              <ol className="text-xs text-left space-y-1 mb-3">
                <li>1. Click 🔒 lock icon in address bar</li>
                <li>2. Find "Microphone" setting</li>
                <li>3. Change to "Allow"</li>
                <li>4. Reload this page (F5)</li>
              </ol>
            )}

            {permissionStatus === 'denied' && isMobile && (
              <ol className="text-xs text-left space-y-1 mb-3">
                <li>1. Open your phone Settings</li>
                <li>2. Go to Privacy → Microphone</li>
                <li>3. Allow access for your browser</li>
                <li>4. Reload this page</li>
              </ol>
            )}

            <button 
              onClick={handleRequestPermission}
              className="mt-2 px-4 py-2 bg-red-600 rounded text-white text-sm hover:bg-red-700"
            >
              🔄 Try Again
            </button>
          </motion.div>
        )}

        {/* Info text */}
        {permissionStatus !== 'granted' && !error && (
          <p className="text-sm opacity-70 mt-4 md:mt-6">
            {isPreloading 
              ? '⏳ Loading assets...'
              : '✅ Ready! Click the button above.'}
          </p>
        )}

        {/* Mobile-specific tips */}
        {isMobile && permissionStatus === 'requesting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded text-blue-200 text-xs"
          >
            📱 <strong>Mobile Note:</strong> If you don't see a permission dialog, your browser might have blocked it. Check your browser settings.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default InitialScreen;