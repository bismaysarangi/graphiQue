import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-black text-gray-300 w-full">
      <div className="max-w-7xl mx-auto py-12 px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {(!isMobile || isMobile) && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
                {!isMobile && (
                  <ul className="mt-4 space-y-4">
                    <li><Link to="/features" className="hover:text-white">Features</Link></li>
                    <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                    <li><Link to="/tutorial" className="hover:text-white">Tutorial</Link></li>
                  </ul>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                {!isMobile && (
                  <ul className="mt-4 space-y-4">
                    <li><Link to="/about" className="hover:text-white">About</Link></li>
                    <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                    <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                  </ul>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                {!isMobile && (
                  <ul className="mt-4 space-y-4">
                    <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                    <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                    <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                  </ul>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                {!isMobile && (
                  <ul className="mt-4 space-y-4">
                    <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
                    <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                    <li><Link to="/cookies" className="hover:text-white">Cookies</Link></li>
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row md:justify-between md:items-center">
          <p className="text-base text-left">&copy; {new Date().getFullYear()} graphiQue, Inc. All rights reserved.</p>
          <div className={`flex space-x-6 ${isMobile ? 'justify-center mt-4' : 'md:ml-auto'}`}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1877F2]">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#E4405F]">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm4.5-1c-.83 0-1.5.67-1.5 1.5S15.67 10 16.5 10s1.5-.67 1.5-1.5S17.33 7 16.5 7z" clipRule="evenodd"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
