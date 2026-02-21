import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Twitter, Linkedin, Scissors, Plus } from 'lucide-react';
import Footer from '../components/Footer';

// --- ANIMATION VARIANTS ---
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const TeamPage = () => {
    const [visibleCount, setVisibleCount] = useState(6); // Initially show 6 members

    // Dummy Data for Team Members
    const teamMembers = [
        { name: "Damian R. Cole", role: "Hair Colorist", img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1887&auto=format&fit=crop" },
        { name: "Adrian B. Fulton", role: "Hair Stylist", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop" },
        { name: "Nathan J. Parker", role: "Grooming Expert", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop" },
        { name: "Emilio J. Harper", role: "Bridal Hair Stylist", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
        { name: "Javier C. Emerson", role: "Beard Specialist", img: "https://images.unsplash.com/photo-1534030347209-7147fd9e791a?q=80&w=1888&auto=format&fit=crop" },
        { name: "Felipe D. Hawthorne", role: "Senior Barber", img: "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=2070&auto=format&fit=crop" },
        { name: "Cristian M. Durant", role: "Blow-Dry Expert", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop" },
        { name: "Melvin T. Morgan", role: "Spa Specialist", img: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=1887&auto=format&fit=crop" }
    ];

    const loadMore = () => {
        setVisibleCount(prev => Math.min(prev + 3, teamMembers.length));
    };

    return (
        <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white overflow-x-hidden">

            {/* ================= 1. HERO SECTION (Specific Design) ================= */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed"></div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="relative z-10 text-center text-white px-6">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold mb-2 tracking-tight">
                            Expert barbers
                        </motion.h1>
                    </motion.div>
                </div>
            </section>


            {/* ================= 2. TEAM GRID ================= */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">

                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
                    >
                        <AnimatePresence>
                            {teamMembers.slice(0, visibleCount).map((member, index) => (
                                <motion.div
                                    key={index}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                    className="group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-500"
                                >
                                    <Link to={`/team/${index + 1}`} className="block h-full w-full">
                                        {/* Image */}
                                        <img
                                            src={member.img}
                                            alt={member.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
                                        />

                                        {/* Content (Glassmorphism Overlay) */}
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg transform transition-all duration-500 hover:bg-white/20">
                                                <h3 className="text-white text-xl font-bold mb-1 tracking-tight">{member.name}</h3>
                                                <p className="text-gray-200 text-sm font-medium tracking-wide">{member.role}</p>

                                                {/* Social Icons (Optional - kept for functionality) */}
                                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    {/* Icons could go here */}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Load More Button */}
                    {visibleCount < teamMembers.length && (
                        <div className="text-center">
                            <button
                                onClick={loadMore}
                                className="px-8 py-3 bg-[#C19D6C] hover:bg-[#a38355] text-white font-bold rounded-full transition duration-300 shadow-lg hover:shadow-xl"
                            >
                                Load More
                            </button>
                        </div>
                    )}

                </div>
            </section>

            {/* ================= 3. FOOTER ================= */}
            <Footer />

        </div>
    );
};

export default TeamPage;
