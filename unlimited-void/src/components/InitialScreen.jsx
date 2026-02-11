import { motion } from 'framer-motion';
import gojoInitial from '../assets/gojo-initial.jpg'; // Import Gojo image as a module

function InitialScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 bg-cover bg-center flex flex-col items-center justify-center z-10"
      style={{
        backgroundImage: `url(${gojoInitial})`, // your Gojo image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Semi-transparent overlay so text is readable */}
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
          Speak "Ryoiki Tenkai" to open.
        </motion.p>

        <p className="text-lg opacity-80">
          Grant microphone access when prompted.
        </p>
      </div>
    </motion.div>
  );
}

export default InitialScreen;