import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "/api";

const AuthModal = ({ showModal, setShowModal, authType, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!email || !password || (authType === 'signup' && !name)) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const endpoint = authType === 'login' ? '/login' : '/signup';
    const payload = authType === 'login' ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        const userData = { isLoggedIn: true, name: data.name };
        setSuccess(`Welcome ${data.name || ''}!`);
        setUser(userData);
        localStorage.setItem('userSession', JSON.stringify(userData));
        
        setTimeout(() => {
          setShowModal(false);
          setSuccess('');
          setEmail('');
          setPassword('');
          setName('');
        }, 1500);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Server connection error');
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-full h-full bg-[#030712]/70 backdrop-blur-md flex justify-center items-center z-[1000]"
            onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="bg-[#0d1326] p-10 rounded-[2rem] w-[90%] max-w-[400px] text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>

            <h2 className="mb-8 text-white text-2xl font-black">
              {authType === 'login' ? 'Sign In to Account' : 'Create New Account'}
            </h2>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm">
                {error}
              </motion.div>
            )}
            
            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-xl text-sm">
                {success}
              </motion.div>
            )}

            {authType === 'signup' && (
              <input
                type="text"
                placeholder="Full Name..."
                className="w-full p-4 mb-4 rounded-2xl bg-[#070b19] border border-white/5 text-white text-base outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder-slate-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <input
              type="email"
              placeholder="Email Address..."
              className="w-full p-4 mb-4 rounded-2xl bg-[#070b19] border border-white/5 text-white text-base outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder-slate-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <input
              type="password"
              placeholder="Password..."
              className="w-full p-4 mb-6 rounded-2xl bg-[#070b19] border border-white/5 text-white text-base outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            
            <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -5px rgba(249, 115, 22, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-full p-4 text-lg font-bold rounded-2xl cursor-pointer transition-shadow shadow-[0_0_15px_rgba(249,115,22,0.2)] flex justify-center items-center h-[60px]"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin text-xl"></i> : (authType === 'login' ? 'Log In' : 'Sign Up')}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;