import React from "react";
import PaintZone from "./pages/PaintZone";
import EditImage from "./pages/EditImage";
import { Edit } from "lucide-react";
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Hero from './pages/Hero';
import Features from './pages/Features';
import Works from './pages/Works';
import FAQ from './pages/FAQ';
import Footer from './pages/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <Works />
          <FAQ />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
