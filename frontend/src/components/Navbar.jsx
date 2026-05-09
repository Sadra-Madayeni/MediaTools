import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_BASE = "/api";

const Navbar = ({ setShowModal, setAuthType, user, setUser }) => {
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { credentials: 'include' });
      setUser({ isLoggedIn: false, name: '' });
      localStorage.removeItem('userSession');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120 }}
      className="flex justify-between items-center px-6 py-4 bg-[#070b19]/70 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 shadow-sm"
    >
      <Link to="/" className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent tracking-tighter drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
        MediaTools
      </Link>
      <div className="flex gap-4 items-center">
        {user.isLoggedIn ? (
          <>
            <span className="text-slate-400 text-sm font-medium mr-2 hidden sm:inline-block">
              Welcome, <span className="text-orange-400 font-bold">{user.name}</span>
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#141b30] border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-300 px-5 py-2 rounded-xl cursor-pointer text-sm font-bold transition-all shadow-sm flex items-center gap-2"
              onClick={handleLogout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-slate-300 hover:text-orange-400 px-6 py-2.5 rounded-xl cursor-pointer text-sm font-bold transition-colors"
              onClick={() => { setShowModal(true); setAuthType('login'); }}
            >
              Log In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-6 py-2.5 rounded-xl cursor-pointer font-bold text-sm shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all"
              onClick={() => { setShowModal(true); setAuthType('signup'); }}
            >
              Sign Up
            </motion.button>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;