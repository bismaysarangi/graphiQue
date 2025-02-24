import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./pages/Navbar";
import Hero from "./pages/Hero";
import Features from "./pages/Features";
import Works from "./pages/Works";
import FAQ from "./pages/FAQ";
import Footer from "./pages/Footer";
import EditImage from "./pages/EditImage";
import PaintZone from "./pages/PaintZone";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Navbar />
        {/* Add padding to prevent content from being covered by the navbar */}
        <main className="pt-20 md:pt-24">
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Hero />
                  <Features />
                  <Works />
                  <FAQ />
                </>
              }
            />
            <Route path="/edit-image" element={<EditImage />} />
            <Route path="/paint-zone" element={<PaintZone />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
