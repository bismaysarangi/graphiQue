import { Link as ScrollLink } from "react-scroll"; // Import react-scroll
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

export default function Navbar() {
  return (
    <header className="px-4 lg:px-6 h-20 flex items-center fixed top-0 w-full z-50 bg-black bg-opacity-50 backdrop-blur-md">
      <Link className="flex items-center justify-center text-white" to="/">
        <span className="ml-2 text-xl font-bold text-white">graphiQue</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <ScrollLink
          to="features"
          smooth={true}
          duration={800}
          offset={-80}
          className="text-sm font-medium text-white hover:text-gray-300 transition-colors cursor-pointer"
        >
          Features
        </ScrollLink>
        <ScrollLink
          to="how-it-works"
          smooth={true}
          duration={800}
          offset={-80}
          className="text-sm font-medium text-white hover:text-gray-300 transition-colors cursor-pointer"
        >
          How It Works
        </ScrollLink>
        <ScrollLink
          to="faq"
          smooth={true}
          duration={800}
          offset={-80}
          className="text-sm font-medium text-white hover:text-gray-300 transition-colors cursor-pointer"
        >
          FAQ
        </ScrollLink>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          to="/login"
          aria-label="Login"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Link>
      </nav>
    </header>
  );
}
