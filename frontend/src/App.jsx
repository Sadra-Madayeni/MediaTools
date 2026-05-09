import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Youtube from './pages/Youtube';
import Instagram from './pages/Instagram';  
import Tiktok from './pages/Tiktok';     

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/youtube" element={<Youtube />} />
        <Route path="/instagram" element={<Instagram />} />
        <Route path="/tiktok" element={<Tiktok />} />
      </Routes>
    </Router>
  );
}

export default App;