import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏠</span>
              <span className="text-xl font-bold gradient-text">PG Finder</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Discover verified PG accommodations and hostels across India. Search, compare, and book with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              <Link to="/search" className="text-gray-500 text-sm hover:text-blue-400 transition-colors">
                Search PGs
              </Link>
              <Link to="/register" className="text-gray-500 text-sm hover:text-blue-400 transition-colors">
                List Your Property
              </Link>
              <Link to="/login" className="text-gray-500 text-sm hover:text-blue-400 transition-colors">
                Login
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Contact
            </h3>
            <div className="flex flex-col gap-2 text-gray-500 text-sm">
              <span>support@pgfinder.com</span>
              <span>+91 98765 43210</span>
              <span>Built with MERN Stack</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} PG Finder. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Made with ❤️ for students and working professionals
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
