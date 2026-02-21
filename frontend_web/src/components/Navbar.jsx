import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Scissors, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Scroll detection for subtle navbar shrink/shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsPagesOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  // Calculate destination route based on user role
  const getProfileRoute = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN' || user.role === 'MANAGER') return '/admin';
    if (user.role === 'EMPLOYEE') return '/employee';
    return '/profile';
  };
  const profileRoute = getProfileRoute();

  // Nav link animation variants
  const linkHover = {
    rest: { width: 0 },
    hover: { width: '100%', transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  // Stagger children for mobile menu
  const mobileMenuVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.04, staggerDirection: -1 }
    }
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  // Dropdown variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.2 } }
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative py-2 transition-colors duration-300 ${isActive(to) ? 'text-[#C19D6C]' : 'text-white/80 hover:text-[#C19D6C]'}`}
    >
      <motion.span initial="rest" whileHover="hover" animate="rest" className="relative">
        {children}
        <motion.span
          variants={linkHover}
          className="absolute bottom-[-4px] left-0 h-[2px] bg-[#C19D6C]"
          style={{ width: isActive(to) ? '100%' : undefined }}
        />
      </motion.span>
    </Link>
  );

  return (
    <div className="fixed top-0 w-full z-50 flex justify-center px-4 md:px-6">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full max-w-7xl transition-all duration-500 ${scrolled
          ? 'mt-3 rounded-2xl bg-[#0A0A0A]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/[0.08] ring-1 ring-[#C19D6C]/10'
          : 'mt-4 rounded-2xl bg-[#0A0A0A]/95 backdrop-blur-md border border-white/[0.06]'
          }`}
      >
        <div className={`px-6 md:px-8 flex justify-between items-center transition-all duration-500 ${scrolled ? 'py-3' : 'py-4'}`}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-10 h-10 bg-gradient-to-br from-[#C19D6C] to-[#a38355] rounded-full flex items-center justify-center shadow-lg shadow-[#C19D6C]/20"
            >
              <Scissors size={20} className="text-black" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tighter group-hover:text-[#C19D6C] transition-colors duration-300">Hair Ways.</h1>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <NavLink to="/">Home</NavLink>

            {/* PAGES DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={() => setIsPagesOpen(true)}
              onMouseLeave={() => setIsPagesOpen(false)}
            >
              <button className={`flex items-center gap-1 py-2 transition-colors duration-300 ${isPagesOpen ? 'text-[#C19D6C]' : 'text-white/80 hover:text-[#C19D6C]'}`}>
                Pages
                <motion.span
                  animate={{ rotate: isPagesOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={14} />
                </motion.span>
              </button>

              {/* Dropdown Content */}
              <AnimatePresence>
                {isPagesOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-xl shadow-2xl p-6 grid grid-cols-3 gap-6 origin-top-left"
                  >
                    {/* Column 1 */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Main</h4>
                      <Link to="/" className="text-gray-600 hover:text-[#C19D6C] transition-colors duration-200">Home</Link>
                      <Link to="/about" className="text-gray-600 hover:text-[#C19D6C] transition-colors duration-200">About</Link>
                      <Link to="/services" className="text-gray-600 hover:text-[#C19D6C] transition-colors duration-200">Services</Link>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Company</h4>
                      <Link to="/team" className="text-gray-600 hover:text-[#C19D6C] transition-colors duration-200">Team</Link>
                      <Link to="/reviews" className="text-gray-600 hover:text-[#C19D6C] transition-colors duration-200">Reviews</Link>
                      <Link to="/gallery" className="text-gray-600 hover:text-[#C19D6C] transition-colors duration-200">Gallery</Link>
                      <Link to="/book" className="text-gray-600 hover:text-[#C19D6C] transition-colors duration-200">Pricing</Link>
                    </div>

                    {/* Column 3 (Image) */}
                    <div className="col-span-1 rounded-lg overflow-hidden h-40 relative">
                      <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" className="w-full h-full object-cover transform hover:scale-110 transition duration-700" alt="Menu Feature" />
                      <div className="absolute inset-0 bg-black/20"></div>
                      <span className="absolute bottom-2 left-2 text-white text-xs font-bold">New Styles</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/about">About</NavLink>
            <NavLink to="/services">Services</NavLink>

            {user ? (
              <Link to={profileRoute} className="flex items-center gap-2 transition text-white/90 group ml-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-1.5 rounded-full transition ${isActive(profileRoute) ? 'bg-[#C19D6C]/20' : 'bg-white/10 group-hover:bg-[#C19D6C]/20'}`}
                >
                  <User size={18} className={`transition ${isActive(profileRoute) ? 'text-[#C19D6C]' : 'text-white/80 group-hover:text-[#C19D6C]'}`} />
                </motion.div>
                <span className={`font-bold transition ${isActive(profileRoute) ? 'text-[#C19D6C]' : 'group-hover:text-[#C19D6C]'}`}>
                  Hi, {user.username}
                </span>
              </Link>
            ) : (
              <NavLink to="/login">Login</NavLink>
            )}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/book" className="px-8 py-3 bg-gradient-to-r from-[#C19D6C] to-[#a38355] text-black font-bold text-sm rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(193,157,108,0.4)] inline-block">
                Book Appointment
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-[#C19D6C] transition"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={28} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={28} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu — Full screen overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 top-[72px] bg-[#0A0A0A]/98 backdrop-blur-xl text-white overflow-y-auto z-40"
          >
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-6 space-y-5"
            >
              <motion.div variants={mobileItemVariants}>
                <Link to="/" className="block text-lg font-medium hover:text-[#C19D6C] transition-colors">Home</Link>
              </motion.div>

              {/* Mobile Pages Section */}
              <motion.div variants={mobileItemVariants} className="space-y-2 pl-4 border-l border-[#C19D6C]/20">
                <p className="text-xs text-gray-500 uppercase tracking-widest">Pages</p>
                <Link to="/about" className="block text-gray-400 hover:text-[#C19D6C] transition-colors">About</Link>
                <Link to="/services" className="block text-gray-400 hover:text-[#C19D6C] transition-colors">Services</Link>
                <Link to="/gallery" className="block text-gray-400 hover:text-[#C19D6C] transition-colors">Gallery</Link>
                <Link to="/team" className="block text-gray-400 hover:text-[#C19D6C] transition-colors">Barbers</Link>
              </motion.div>

              <motion.div variants={mobileItemVariants}>
                <Link to="/about" className="block text-lg font-medium hover:text-[#C19D6C] transition-colors">About</Link>
              </motion.div>
              <motion.div variants={mobileItemVariants}>
                <Link to="/services" className="block text-lg font-medium hover:text-[#C19D6C] transition-colors">Services</Link>
              </motion.div>

              {user ? (
                <motion.div variants={mobileItemVariants}>
                  <Link to={profileRoute} className="flex items-center gap-3 text-lg font-bold text-[#C19D6C]">
                    <div className="p-2 rounded-full bg-[#C19D6C]/10 border border-[#C19D6C]/20">
                      <User size={20} />
                    </div>
                    Hi, {user.username}
                  </Link>
                </motion.div>
              ) : (
                <motion.div variants={mobileItemVariants}>
                  <Link to="/login" className="block text-lg font-medium hover:text-[#C19D6C] transition-colors">Login</Link>
                </motion.div>
              )}

              <motion.div variants={mobileItemVariants}>
                <Link to="/book" className="block w-full text-center py-4 bg-gradient-to-r from-[#C19D6C] to-[#a38355] text-black font-bold rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(193,157,108,0.3)] transition-shadow">
                  Book Now
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
