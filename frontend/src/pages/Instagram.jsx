import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const API_BASE = "/api";

const Instagram = () => {
  const [mode, setMode] = useState('video');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSearch = async () => {
    if (!input) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/search/instagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input, mode: mode })
      });
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Error fetching data');
      }
    } catch (err) {
      setError('Error connecting to the server');
    }
    setLoading(false);
  };

  const handleDownload = async (url, type, title = 'insta') => {
    const downloadId = 'ig_' + Date.now();
    setDownloading(true);
    setProgress(0);
    setStatusMsg('Initializing process...');

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
          url: url,
          type: type,
          title: title,
          thumbnail: result.thumbnail,
          quality: 'best',
          id: downloadId
        })
      });
      const data = await res.json();
      clearInterval(interval);
      
      if (data.status === 'ready') {
        setProgress(100);
        setStatusMsg('Operation successful!');
        window.location.href = `${API_BASE}/file/${encodeURIComponent(data.filename)}`;
        setTimeout(() => setDownloading(false), 3000);
      } else {
        setError(data.error);
        setDownloading(false);
      }
    } catch (err) {
      clearInterval(interval);
      setDownloading(false);
      setError('Error executing process');
    }
  };

  const getProxyUrl = (url) => `${API_BASE}/proxy-image?url=${encodeURIComponent(url)}`;

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
            Instagram Module
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex justify-center items-center border border-orange-500/20">
              <i className="fa-brands fa-instagram text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"></i>
            </div>
          </h1>
        </div>

        <div className="flex bg-[#141b30] rounded-2xl p-1.5 mb-8 border border-white/5 backdrop-blur-xl shadow-inner">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'video' ? 'bg-white/10 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
            onClick={() => { setMode('video'); setResult(null); }}
          >
            <i className="fa-solid fa-clapperboard"></i> Process Post/Reel
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'profile' ? 'bg-white/10 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
            onClick={() => { setMode('profile'); setResult(null); }}
          >
            <i className="fa-solid fa-user"></i> Fetch Profile
          </motion.button>
        </div>

        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative flex items-center bg-[#0d1326] border border-white/10 rounded-2xl p-2 shadow-lg backdrop-blur-xl">
            <input 
              type="text" 
              placeholder={mode === 'video' ? "Media Link (Post, Reel)..." : "Username (without @)..."} 
              className="flex-1 bg-transparent border-none text-white px-4 py-3 outline-none placeholder-slate-500 w-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
            
            {result.type === 'profile' ? (
              <div className="flex flex-col items-center">
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-orange-500 to-blue-500 mb-5 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                  <img src={getProxyUrl(result.thumbnail)} className="w-32 h-32 rounded-full border-4 border-[#0d1326] object-cover" alt="profile" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 flex items-center justify-center gap-2">
                  {result.is_private && <i className="fa-solid fa-lock text-sm text-slate-400"></i>} 
                  @{result.uploader}
                </h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-sm whitespace-pre-wrap">{result.biography}</p>
                
                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -5px rgba(249,115,22,0.3)' }} 
                  whileTap={{ scale: 0.98 }} 
                  className="w-full py-4 px-6 rounded-xl border-none bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold cursor-pointer flex justify-center items-center gap-3 text-base shadow-lg" 
                  onClick={() => window.open(result.thumbnail, '_blank')}
                >
                  <i className="fa-solid fa-image text-lg"></i> Extract Original Image
                </motion.button>
              </div>
            ) : (
              <div>
                {result.type === 'slideshow' ? (
                  <div className="mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {result.slides.map((slide, idx) => (
                        <motion.div whileHover={{ y: -5 }} key={idx} className="bg-[#141b30] border border-white/5 p-4 rounded-xl flex flex-col items-center shadow-inner">
                          <span className="text-xs font-bold text-slate-500 mb-3 bg-white/5 px-2 py-1 rounded-md">Slide {idx + 1}</span>
                          <button 
                            className="w-full py-2 rounded-lg border-none bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-pointer text-xs font-bold shadow-md hover:shadow-lg transition-shadow" 
                            onClick={() => handleDownload(slide, 'video', `slide_${idx}`)}
                          >
                            Extract
                          </button>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 bg-[#141b30] py-2 rounded-lg border border-white/5">
                      Identified <span className="text-orange-400 font-bold">{result.slides.length}</span> media files in this request
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg border border-white/5">
                    <img src={getProxyUrl(result.thumbnail)} className="w-full max-h-80 object-cover hover:scale-105 transition-transform duration-500" alt="thumb" />
                  </div>
                )}

                {result.title && (
                  <div className="bg-[#141b30] p-4 rounded-xl border border-white/5 mb-6 text-left">
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {result.title.length > 120 ? result.title.substring(0, 120) + '...' : result.title}
                    </p>
                  </div>
                )}

                {downloading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 bg-[#141b30] p-5 rounded-xl border border-white/5">
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

                {!downloading && result.type !== 'slideshow' && (
                  <div className="flex flex-col md:flex-row gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -5px rgba(249,115,22,0.3)' }} 
                      whileTap={{ scale: 0.98 }} 
                      className="flex-1 py-4 px-6 rounded-xl border-none bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold cursor-pointer flex justify-center items-center gap-3 text-base shadow-lg" 
                      onClick={() => handleDownload(result.url, 'video', result.title)}
                    >
                      <i className="fa-solid fa-download text-lg"></i> Download Media
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }} 
                      className="flex-1 py-4 px-6 rounded-xl border border-white/10 bg-[#141b30] text-slate-200 cursor-pointer flex justify-center items-center gap-3 text-base hover:bg-white/5 transition-colors" 
                      onClick={() => handleDownload(result.url, 'mp3', result.title)}
                    >
                      <i className="fa-solid fa-music text-lg text-slate-400"></i> Extract Audio
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Instagram;