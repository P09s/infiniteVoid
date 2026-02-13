import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import voidStatic from '../assets/void-static.png';
import channelLogo from '../assets/channel-logo.jpeg';

export default function VoidAnimation({ phase }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      const playVideo = async () => {
        try {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = false; 
          videoRef.current.volume = 1.0;

          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('✨ Video playing with audio');
              })
              .catch(err => {
                console.warn('Autoplay blocked. Using muted fallback.', err);
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.play().catch(e => console.error('Final play error:', e));
                }
              });
          }
        } catch (err) {
          console.error('Play error:', err);
        }
      };

      playVideo();
    }
  }, [phase]);

  const messages = [
    "Subscribe DAEMON or you're GAYJO", 
    "Subscribe DAEMON or you're GAYJO", 
    "Subscribe DAEMON or you're GAYJO", 
    "Subscribe DAEMON or you're GAYJO", 
    "Subscribe DAEMON or you're GAYJO"
  ];
  
  const infoItems = Array.from({ length: 30 }, (_, i) => ({
    text: messages[i % messages.length],
    angle: Math.random() * Math.PI * 2,
    distance: 100 + Math.random() * 400,
    speed: 10 + Math.random() * 15,
    size: 0.8 + Math.random() * 0.8,
    delay: Math.random() * 2.5,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 overflow-hidden bg-black"
      key={phase}
      onClick={() => {
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.volume = 1.0;
          videoRef.current.play().catch(e => console.log('Click play:', e));
        }
      }}
    >
      {phase === 'video' ? (
        <>
          <video
            ref={videoRef}
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ pointerEvents: 'none', zIndex: 0 }}
          >
            <source src="/videos/unlimited-void-loop.mp4" type="video/mp4" />
          </video>

          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-950/55 via-indigo-950/35 to-black/75 pointer-events-none"
            style={{ zIndex: 1 }}
          />
        </>
      ) : (
        <>
          <img 
            src={voidStatic} 
            alt="Void Static" 
            className="absolute inset-0 w-full h-full object-cover" 
            style={{ zIndex: 0 }} 
          />
          
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/60 via-indigo-950/40 to-black/70 pointer-events-none" style={{ zIndex: 1 }} />
          
          <motion.a 
            href="https://www.youtube.com/@DaemonPOV" 
            target="_blank" 
            rel="noopener noreferrer" 
            initial={{ opacity: 0, scale: 0.8, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.5 }} 
            className="absolute bottom-8 right-8 z-20" 
            style={{ cursor: 'pointer' }} 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-3 bg-red-600 hover:bg-red-700 transition-colors px-6 py-3 rounded-full shadow-lg">
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center overflow-hidden">
                <img 
                   src={channelLogo} 
                   alt="Channel Logo" 
                   className="w-full h-full object-cover rounded-full" 
                />
              </div>
              <span className="text-white font-bold text-lg">Subscribe DAEMON</span>
            </div>
          </motion.a>
        </>
      )}

      {infoItems.map((item, index) => (
        <motion.p
          key={index}
          initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.7, 0.9, 0.6, 0], 
            scale: [0.3, item.size * 1.4, item.size], 
            x: Math.cos(item.angle) * 1200, 
            y: Math.sin(item.angle) * 1200 
          }}
          transition={{ 
            duration: item.speed, 
            delay: item.delay, 
            ease: 'easeOut', 
            repeat: Infinity, 
            repeatDelay: Math.random() * 2 
          }}
          className="absolute text-blue-200/70 md:text-blue-100/60 text-xs sm:text-sm md:text-base font-mono whitespace-nowrap pointer-events-none"
          style={{ 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)', 
            textShadow: '0 0 8px rgba(59, 130, 246, 0.6)', 
            zIndex: 10 
          }}
        >
          {item.text}
        </motion.p>
      ))}

      {Array.from({ length: 20 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 6 + Math.random() * 10;
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-400/50 rounded-full pointer-events-none"
            style={{ zIndex: 5 }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ 
              x: Math.cos(angle) * 1500, 
              y: Math.sin(angle) * 1500, 
              scale: [0, 1.2, 0], 
              opacity: [0, 0.8, 0] 
            }}
            transition={{ 
              duration: speed, 
              delay: Math.random() * 4, 
              repeat: Infinity, 
              ease: 'easeOut' 
            }}
          />
        );
      })}
    </motion.div>
  );
}