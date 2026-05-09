import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const ToolCard = ({ to, bgClass, iconClass, iconColor, title, desc }) => (
  <motion.div
    whileHover={{ y: -8, boxShadow: '0 20px 40px -15px rgba(249,115,22,0.15)' }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
      <Link to={to} className={`block p-8 rounded-3xl bg-[#0d1326] border border-white/5 text-center transition-all shadow-lg ${bgClass} hover:border-orange-500/30`}>
        <div className="w-20 h-20 mx-auto rounded-2xl flex justify-center items-center mb-5 bg-[#141b30] shadow-inner border border-white/5">
          <i className={`${iconClass} text-4xl drop-shadow-sm`} style={{ color: iconColor }}></i>
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </Link>
  </motion.div>
);

const Landing = () => {
  const [showServices, setShowServices] = useState(false);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-20 pb-16 px-6 max-w-5xl mx-auto text-center relative z-10">
        
        {/* <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-bold text-sm mb-8 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
        >
            <i className="fa-brands fa-github text-lg ml-1"></i>
            Open-Source Project
        </motion.div> */}

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="text-[clamp(32px,5vw,56px)] font-black tracking-tighter mb-6 leading-tight text-white"
        >
          Powerful Media <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Processing & Extraction</span> Engine
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-slate-400 text-[clamp(16px,3vw,18px)] leading-relaxed max-w-3xl font-medium mb-12"
        >
          A full-stack platform developed with React and Flask for metadata extraction, API rate-limit bypassing, and media processing using yt-dlp and FFmpeg.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="w-full max-w-3xl"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="bg-[#0d1326]/80 p-8 md:p-12 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden backdrop-blur-md"
          >
            <div className="absolute top-0 left-0 w-40 h-40 bg-orange-500/10 rounded-br-full -z-10"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-tl-full -z-10"></div>

            <div className="flex flex-col items-center z-10 relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#141b30] to-[#0a0f1c] rounded-3xl flex justify-center items-center mb-6 shadow-lg border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl group-hover:bg-orange-500/30 transition-colors"></div>
                <i className="fa-brands fa-youtube text-5xl text-orange-500 relative z-10 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"></i>
              </div>
              <h2 className="text-3xl font-black text-white mb-3">YouTube Processing Module</h2>
              <p className="text-slate-400 mb-8 max-w-md">Parse links, extract Full HD streams, and automatically convert to audio formats on the server side.</p>

              <Link to="/youtube" className="w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 15px 30px -10px rgba(249,115,22,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  <span>Test & Explore Module</span>
                  <i className="fa-solid fa-code-branch"></i>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16"
        >
          <button
            onClick={() => setShowServices(!showServices)}
            className="flex items-center gap-3 bg-[#0d1326] border border-white/10 text-slate-300 hover:text-orange-400 hover:border-orange-500/30 px-8 py-3.5 rounded-full font-bold transition-all shadow-lg mx-auto cursor-pointer"
          >
            <span>{showServices ? 'Close Other Modules' : 'View Other Modules'}</span>
            <i className={`fa-solid fa-chevron-${showServices ? 'up' : 'down'} text-sm transition-transform duration-300`}></i>
          </button>
        </motion.div>

        <AnimatePresence>
          {showServices && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-4xl mx-auto pb-10">
                <ToolCard
                  to="/instagram"
                  bgClass="hover:bg-[#141b30]"
                  iconClass="fa-brands fa-instagram"
                  iconColor="#f97316"
                  title="Instagram Extractor"
                  desc="Fetch metadata and public media while bypassing rate limits."
                />
                <ToolCard
                  to="/tiktok"
                  bgClass="hover:bg-[#141b30]"
                  iconClass="fa-brands fa-tiktok"
                  iconColor="#f97316"
                  title="TikTok Handler"
                  desc="Communicate with TikTok servers to extract raw video sources without watermarks."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default Landing;