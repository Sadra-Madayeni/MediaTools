import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const API_BASE = "/api";

const Youtube = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [quality, setQuality] = useState('best');
  
  
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

   
  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/search/youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Error finding video');
      }
    } catch (err) {
      setError('Error connecting to the server');
    }
    setLoading(false);
  };

 
  const handleDownload = async (type) => {
    const downloadId = 'yt_' + Date.now();
    setDownloading(true);
    setProgress(0);
    setStatusMsg('Starting download...');

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/progress/${downloadId}`);
        const data = await res.json();
        if (data.percent) {
          setProgress(data.percent);
          setStatusMsg(data.msg);
        }
      } catch {}
    }, 500);

    try {
      const res = await fetch(`${API_BASE}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: result.url,
          type: type,
          title: result.title,
          thumbnail: result.thumbnail,
          quality: quality,
          id: downloadId
        })
      });
      const data = await res.json();
      
      clearInterval(interval);
      
      if (data.status === 'ready') {
        setProgress(100);
        setStatusMsg('Completed!');
        window.location.href = `${API_BASE}/file/${encodeURIComponent(data.filename)}`;
        setTimeout(() => setDownloading(false), 3000);
      } else {
        setError(data.error);
        setDownloading(false);
      }
    } catch (err) {
      clearInterval(interval);
      setDownloading(false);
      setError('Error during download');
    }
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-2xl mx-auto w-full px-6 pt-10 pb-20 relative z-10"
      >
         
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-orange-500 bg-white/5 border border-white/5 px-4 py-2 rounded-xl transition-all backdrop-blur-sm">
            <i className="fa-solid fa-arrow-left"></i> Back
          </Link>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            YouTube Module
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex justify-center items-center border border-orange-500/20">
              <i className="fa-brands fa-youtube text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"></i>
            </div>
          </h1>
        </div>

        
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative flex items-center bg-[#0d1326] border border-white/10 rounded-2xl p-2 shadow-lg backdrop-blur-xl">
            <input 
              type="text" 
              placeholder="YouTube Link or Just The Video Name!" 
              className="flex-1 bg-transparent border-none text-white px-4 py-3 outline-none placeholder-slate-500 w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(249,115,22,0.4)' }} 
              whileTap={{ scale: 0.95 }}
              className="w-14 h-12 rounded-xl border-none bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-pointer text-lg flex justify-center items-center shadow-md ml-2" 
              onClick={handleSearch} 
              disabled={loading}
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-search"></i>}
            </motion.button>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center mb-6 shadow-sm">
            {error}
          </motion.div>
        )}

         
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1326]/80 p-6 md:p-8 rounded-[2rem] border border-white/5 text-center backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
            <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg border border-white/5">
              <img src={result.thumbnail} className="w-full object-cover hover:scale-105 transition-transform duration-500" alt="thumb" />
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-sm text-white font-bold border border-white/10">
                {result.duration}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6 leading-relaxed px-2">{result.title}</h3>

             
            <div className="relative mb-6">
              <select className="w-full p-4 bg-[#141b30] text-slate-200 border border-white/10 rounded-xl outline-none appearance-none cursor-pointer focus:border-orange-500/50 transition-colors" value={quality} onChange={(e) => setQuality(e.target.value)}>
                <option value="best">Best Available Quality (Auto)</option>
                {result.qualities.map(q => (
                  <option key={q} value={q}>{q}p Resolution</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
            </div>

           
            {downloading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-[#141b30] p-5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-3 text-sm font-bold text-slate-300">
                  <span>{statusMsg}</span>
                  <span className="text-orange-400">{progress}%</span>
                </div>
                <div className="h-2.5 bg-[#070b19] rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300 relative" style={{ width: `${progress}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            )}

             
            {!downloading && (
              <div className="flex flex-col md:flex-row gap-4 mt-8">
                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -5px rgba(249,115,22,0.3)' }} 
                  whileTap={{ scale: 0.98 }} 
                  className="flex-1 py-4 px-6 rounded-xl border-none bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold cursor-pointer flex justify-center items-center gap-3 text-base shadow-lg" 
                  onClick={() => handleDownload('video')}
                >
                  <i className="fa-solid fa-video text-lg"></i> Download Video (MP4)
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  className="flex-1 py-4 px-6 rounded-xl border border-white/10 bg-[#141b30] text-slate-200 cursor-pointer flex justify-center items-center gap-3 text-base hover:bg-white/5 transition-colors" 
                  onClick={() => handleDownload('mp3')}
                >
                  <i className="fa-solid fa-music text-lg text-slate-400"></i> Extract Audio (MP3)
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Youtube;