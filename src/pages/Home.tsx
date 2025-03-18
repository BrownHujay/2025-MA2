import { motion } from "framer-motion";
import Navbar from "../components/navbar";

export default function Home() {
  // Variants for the letters in the initial subtitle
  const initialLetter = {
    initial: { opacity: 1, y: 0 },
    hover: { opacity: 0, y: -20 },
  };

  // Variants for the letters in the hover subtitle
  const hoverLetter = {
    initial: { opacity: 0, y: 20 },
    hover: { opacity: 1, y: 0 },
  };

  // A parent variant to stagger children animations
  const staggerContainer = {
    hover: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Helper function to render each character, preserving spaces
  const renderChars = (text: string, variant: any, prefix: string) =>
    text.split("").map((char, i) => (
      <motion.span
        key={`${prefix}-${i}`}
        variants={variant}
        style={{ display: "inline-block" }}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-800 to-black font-[orbitron]">
      <div className="absolute top-10 right-5">
        <Navbar />
      </div>
      <h1 className="relative text-9xl text-white inline-block px-4 py-2">
        Reclaim
        <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></span>
        <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></span>
      </h1>

      {/* Subtitle with animated letters on hover */}
      <motion.div
        className="mt-8 text-3xl text-white relative inline-block text-center"
        initial="initial"
        whileHover="hover"
      >
        {/* Initial subtitle - "One Man's Trash" */}
        <motion.div className="absolute inset-0 flex items-center justify-center" variants={staggerContainer}>
          {renderChars("One Man's Trash", initialLetter, "initial")}
        </motion.div>
        {/* Hover subtitle - "Another Man's Treasure" */}
        <motion.div className="relative flex items-center justify-center" variants={staggerContainer}>
          {renderChars("Another Man's Treasure", hoverLetter, "hover")}
        </motion.div>
      </motion.div>
    </div>
  );
}
