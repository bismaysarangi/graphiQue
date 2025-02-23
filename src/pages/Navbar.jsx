import { useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import { LogIn, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="px-4 lg:px-6 h-20 flex items-center fixed top-0 w-full z-50 bg-black bg-opacity-50 backdrop-blur-md">
      <ScrollLink className="flex items-center justify-center text-white" to="home" smooth={true} duration={800}>
        <span className="ml-2 text-xl font-bold text-white">GraphiQue</span>
      </ScrollLink>

      {/* Mobile Menu Button */}
      <button
        className="ml-auto block lg:hidden text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Menu */}
      <nav className="ml-auto hidden lg:flex items-center gap-4 sm:gap-6">
        <ScrollLink to="features" smooth={true} duration={800} offset={-80} className="text-sm font-medium text-white hover:text-gray-300 transition-colors cursor-pointer">
          Features
        </ScrollLink>
        <ScrollLink to="how-it-works" smooth={true} duration={800} offset={-80} className="text-sm font-medium text-white hover:text-gray-300 transition-colors cursor-pointer">
          How It Works
        </ScrollLink>
        <ScrollLink to="faq" smooth={true} duration={800} offset={-80} className="text-sm font-medium text-white hover:text-gray-300 transition-colors cursor-pointer">
          FAQ
        </ScrollLink>
        <button className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200" aria-label="Login" onClick={() => console.log("Login button clicked")}> 
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </button>
      </nav>

      {/* Mobile Menu - Small Dropdown */}
      {isOpen && (
        <div className="absolute top-16 right-4 w-48 bg-black bg-opacity-90 rounded-lg shadow-lg flex flex-col items-start gap-2 py-3 px-4 lg:hidden">
          <ScrollLink to="features" smooth={true} duration={800} offset={-80} className="text-sm font-medium text-white hover:text-gray-300 transition-colors cursor-pointer w-full" onClick={() => setIsOpen(false)}>
            Features
          </ScrollLink>
          <ScrollLink to="how-it-works" smooth={true} duration={800} offset={-80} className="text-sm font-medium text-white hover:text-gray-300 transition-colors cursor-pointer w-full" onClick={() => setIsOpen(false)}>
            How It Works
          </ScrollLink>
          <ScrollLink to="faq" smooth={true} duration={800} offset={-80} className="text-sm font-medium text-white hover:text-gray-300 transition-colors cursor-pointer w-full" onClick={() => setIsOpen(false)}>
            FAQ
          </ScrollLink>
          <button className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200 w-full" aria-label="Login" onClick={() => setIsOpen(false)}>
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </button>
        </div>
      )}
    </header>
  );
}