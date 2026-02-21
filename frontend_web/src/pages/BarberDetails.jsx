import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Linkedin, Youtube, ArrowLeft, Mail, Clock, Scissors } from 'lucide-react';
import Footer from '../components/Footer';

// --- DUMMY DATA (In a real app, fetch this from API) ---
const teamData = [
    { id: 1, name: "Damian R. Cole", role: "Hair Colorist", exp: "15+ Years", email: "damian@hairways.com", img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1887&auto=format&fit=crop", bio: "For me, beauty is more than appearance—it's confidence, creativity, and care. Every client's journey is unique, and I believe in transforming not just looks but how people feel about themselves." },
    { id: 2, name: "Adrian B. Fulton", role: "Hair Stylist", exp: "10+ Years", email: "adrian@hairways.com", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop", bio: "Passionate about creating styles that define personality. I specialize in modern cuts and classic grooming techniques." },
    { id: 3, name: "Nathan J. Parker", role: "Grooming Expert", exp: "8+ Years", email: "nathan@hairways.com", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop", bio: "Detail-oriented and dedicated to the craft of grooming. I ensure every cut is precise and suits the client's lifestyle." },
    { id: 4, name: "Emilio J. Harper", role: "Bridal Hair Stylist", exp: "12+ Years", email: "emilio@hairways.com", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop", bio: "Specializing in bridal and event styling, I make sure you look your absolute best for your big day." },
    { id: 5, name: "Javier C. Emerson", role: "Beard Specialist", exp: "9+ Years", email: "javier@hairways.com", img: "https://images.unsplash.com/photo-1534030347209-7147fd9e791a?q=80&w=1888&auto=format&fit=crop", bio: "A master of beards. From trims to full sculpting, I help you maintain a sharp and clean look." },
    { id: 6, name: "Felipe D. Hawthorne", role: "Senior Barber", exp: "14+ Years", email: "felipe@hairways.com", img: "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=2070&auto=format&fit=crop", bio: "Classic barbering with a modern twist. I bring years of experience to every cut." },
    { id: 7, name: "Cristian M. Durant", role: "Blow-Dry Expert", exp: "7+ Years", email: "cristian@hairways.com", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop", bio: "Expert in blow-drys and styling. I add volume and life to your hair." },
    { id: 8, name: "Melvin T. Morgan", role: "Spa Specialist", exp: "6+ Years", email: "melvin@hairways.com", img: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=1887&auto=format&fit=crop", bio: "Relaxation and rejuvenation are my priorities. I provide top-tier spa treatments." }
];

const BarberDetails = () => {
    const { id } = useParams();
    // Find member by ID (convert id to number)
    const member = teamData.find(m => m.id === parseInt(id)) || teamData[0];

    return (
        <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white pt-24">

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Back Button */}
                <Link to="/team" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#C19D6C] mb-8 transition font-bold text-sm">
                    <ArrowLeft size={18} /> Back to Team
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* LEFT: IMAGE */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl"
                    >
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                    </motion.div>

                    {/* RIGHT: DETAILS */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C19D6C] text-white text-xs font-bold uppercase tracking-wider w-fit shadow-md">
                            <Scissors size={14} /> About Barber
                        </div>

                        {/* Name & Bio */}
                        <div>
                            <h1 className="text-5xl font-bold mb-6 text-[#0B0B0B] leading-tight">{member.name}</h1>
                            <p className="text-gray-600 text-lg leading-relaxed">{member.bio}</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Responsibility</p>
                                <p className="font-bold text-lg">{member.role}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Experience</p>
                                <p className="font-bold text-lg">{member.exp}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Email</p>
                                <p className="font-bold text-lg text-[#C19D6C] flex items-center gap-2">
                                    <Mail size={18} /> {member.email}
                                </p>
                            </div>
                        </div>

                        {/* Experience Section */}
                        <div className="pt-6">
                            <h3 className="text-2xl font-bold mb-3">Experience</h3>
                            <p className="text-gray-600 leading-relaxed">
                                From precision fades to timeless styles, {member.name.split(' ')[0]} is where skill and style come together to give you the confidence you deserve. Highly rated by clients for attention to detail.
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="pt-6">
                            <h3 className="text-2xl font-bold mb-4">Follow Me</h3>
                            <p className="text-gray-500 mb-6 text-sm">Follow me to see how small changes in style can bring out big changes in confidence.</p>
                            <div className="flex gap-4">
                                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#C19D6C] hover:text-white hover:border-[#C19D6C] transition duration-300"><Instagram size={20} /></a>
                                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#C19D6C] hover:text-white hover:border-[#C19D6C] transition duration-300"><Twitter size={20} /></a>
                                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#C19D6C] hover:text-white hover:border-[#C19D6C] transition duration-300"><Linkedin size={20} /></a>
                                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#C19D6C] hover:text-white hover:border-[#C19D6C] transition duration-300"><Youtube size={20} /></a>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BarberDetails;
