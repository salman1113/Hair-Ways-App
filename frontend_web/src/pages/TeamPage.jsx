import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Twitter, Linkedin, Scissors, Plus } from 'lucide-react';


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
    const [teamMembers, setTeamMembers] = useState([]);
    const [visibleCount, setVisibleCount] = useState(6); // Initially show 6 members
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                // Assuming your backend URL is running on ALB domain
                // Use a relative path if proxy is configured, or full URL
                const response = await fetch('https://api.hairways.in/api/v1/accounts/employees/');
                if (!response.ok) throw new Error('Failed to fetch team');
                const data = await response.json();
                setTeamMembers(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching team:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

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
                        <motion.h1 variants={fadeInUp} className="text-4xl md:text-7xl font-bold mb-2 tracking-tight">
                            Expert barbers
                        </motion.h1>
                    </motion.div>
                </div>
            </section>


            {/* ================= 2. TEAM GRID ================= */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">

                    {loading ? (
                        <div className="text-center text-gray-500 py-12">Loading team members...</div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-12">Failed to load team members.</div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
                        >
                            <AnimatePresence>
                                {teamMembers.slice(0, visibleCount).map((member) => (
                                    <motion.div
                                        key={member.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4 }}
                                        className="group relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-500"
                                    >
                                        <Link to={`/team/${member.id}`} className="block h-full w-full bg-gray-100">
                                            {/* Image */}
                                            <img
                                                src={member.user_details?.profile_picture || ""}
                                                alt={member.username}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
                                            />

                                            {/* Content (Glassmorphism Overlay) */}
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg transform transition-all duration-500 hover:bg-white/20">
                                                    <h3 className="text-white text-xl font-bold mb-1 tracking-tight">{member.username}</h3>
                                                    <p className="text-gray-200 text-sm font-medium tracking-wide">{member.job_title}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* Load More Button */}
                    {!loading && !error && visibleCount < teamMembers.length && (
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


        </div>
    );
};

export default TeamPage;
