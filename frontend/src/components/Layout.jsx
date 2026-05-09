import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from './AuthModal';

const API_BASE = "/api";

const Layout = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [authType, setAuthType] = useState('login');
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userSession');
    return savedUser ? JSON.parse(savedUser) : { isLoggedIn: false, name: '' };
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, { credentials: 'include' });
        const data = await res.json();
        if (data.is_logged_in) {
          const userData = { isLoggedIn: true, name: data.name };
          setUser(userData);
          localStorage.setItem('userSession', JSON.stringify(userData));
        } else {
          setUser({ isLoggedIn: false, name: '' });
          localStorage.removeItem('userSession');
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen text-slate-200 font-sans relative flex flex-col" dir="ltr">
      <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none bg-[#070b19]">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px]"></div>
      </div>

      <Navbar setShowModal={setShowModal} setAuthType={setAuthType} user={user} setUser={setUser} />

      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer />
      <AuthModal showModal={showModal} setShowModal={setShowModal} authType={authType} setUser={setUser} />
    </div>
  );
};

export default Layout;