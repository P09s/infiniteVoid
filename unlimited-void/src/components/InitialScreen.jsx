import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import gojoInitial from '../assets/gojo-initial.jpg';

function InitialScreen({ onPermissionGranted }) {
  const [isPreloading, setIsPreloading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('idle');
  const [error, setError] = useState('');
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [acknowledgedMobile, setAcknowledgedMobile] = useState(false);

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

        await fetch(videoPath).then(r => r.blob()).catch(e => console.log('Video prefetch skipped'));

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
      await new Promise(resolve => setTimeout(resolve, 100));

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      console.log('📊 Calling getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Stream obtained, passing to App...');

      clearTimeout(timeoutId);
      setPermissionStatus('granted');
      console.log('✅ Permission granted!');

      setTimeout(() => {
        onPermissionGranted(stream);
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

  // 🟣 COMPACT MOBILE BLOCKING MODAL 🟣
  if (isMobile && !acknowledgedMobile) {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3">
        {/* Dark background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-black to-black/80" />

        {/* Compact Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className="relative z-10 bg-gradient-to-br from-purple-900/95 via-purple-950/90 to-black/95 rounded-xl p-5 sm:p-6 max-w-sm w-full border-2 border-purple-600/60 shadow-2xl"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-xl opacity-50" />

          {/* Content */}
          <div className="relative z-10">
            {/* DAEMON Notice - Top */}
            <div className="bg-red-950/60 rounded-lg p-2 mb-3 border border-red-600/50 text-center">
              <p className="text-red-300 font-black text-xs sm:text-sm">
                ⚠️ DAEMON NOTICE ⚠️
              </p>
              <p className="text-red-200 font-bold text-xs mt-1">
                Limited Mobile Experience
              </p>
            </div>

            {/* Icon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl sm:text-5xl text-center mb-3"
            >
              💜
            </motion.div>

            {/* Title - Hinglish */}
            <h1 className="text-lg sm:text-xl font-black text-center text-purple-200 mb-2 drop-shadow-lg">
              💜 Gojo Ka Aashirwad! 💜
            </h1>

            {/* Main Message - Hinglish */}
            <div className="bg-purple-950/50 rounded-lg p-3 mb-3 border border-purple-600/40 text-center">
              <p className="text-purple-100 font-bold text-sm leading-tight">
                Gojo ko feel karna hai?
              </p>
              <p className="text-purple-300 font-bold text-sm mt-1 leading-tight">
                To <span className="text-purple-100 font-black">LAPTOP</span> mein dekho! 💻
              </p>
              <p className="text-red-300 font-semibold text-xs mt-2 leading-tight">
                Choti screen mein magic nahi chalega! 😭
              </p>
            </div>

            {/* Voice Commands - Hinglish */}
            <div className="bg-purple-950/40 rounded-lg p-2.5 mb-3 border border-purple-500/30">
              <p className="text-center text-purple-300 text-xs font-bold mb-1.5">
                Laptop mein ye bolna:
              </p>
              <p className="text-center text-purple-100 font-black text-sm">
                🎤 "Ryoiki Tenkai"
              </p>
              <p className="text-center text-purple-200 text-xs mt-1">
                ya "Domain Expansion"
              </p>
            </div>

            {/* Buttons - Hinglish */}
            <div className="space-y-2">
              {/* Laptop Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  console.log('✅ User confirmed using laptop');
                  setAcknowledgedMobile(true);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-2 px-3 rounded-lg transition-all shadow-lg text-xs sm:text-sm"
              >
                ✅ Laptop mein hoon!
              </motion.button>

              {/* Mobile Accept Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={() => {
                  console.log('⚠️ User acknowledged mobile limitation');
                  setAcknowledgedMobile(true);
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-1.5 px-3 rounded-lg transition-all shadow-lg text-xs"
              >
                ⚠️ Phir bhi mobile pe chalana hai
              </motion.button>
            </div>

            {/* Footer */}
            <p className="text-center text-purple-300 text-xs mt-2 opacity-60">
              💡 Best on Desktop!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // DESKTOP/ACKNOWLEDGED VERSION - ORIGINAL SCREEN
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
            ? 'Speak "Ryoiki Tenkai / Domain Expansion" to open.'
            : 'Enable microphone to begin.'}
        </motion.p>

        {isPreloading && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm opacity-70 mb-6"
          >
            Loading assets...
          </motion.div>
        )}

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

        {permissionStatus !== 'granted' && !error && (
          <p className="text-sm opacity-70 mt-4 md:mt-6">
            {isPreloading 
              ? '⏳ Loading assets...'
              : '✅ Ready! Click the button above.'}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default InitialScreen;