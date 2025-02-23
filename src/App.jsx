import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./pages/Navbar";
import Hero from "./pages/Hero";
import Features from "./pages/Features";
import Works from "./pages/Works";
import FAQ from "./pages/FAQ";
import Footer from "./pages/Footer";
import EditImage from "./pages/EditImage"; // Import the Edit Image page
import PaintZone from "./pages/PaintZone"; // Import the Paint Zone page

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-white">
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
