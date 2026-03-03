import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Linkedin, Youtube, ArrowLeft, Mail, Clock, Scissors } from 'lucide-react';


const BarberDetails = () => {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBarber = async () => {
            try {
                const response = await fetch(`https://api.hairways.in/api/v1/accounts/employees/${id}/`);
                if (!response.ok) throw new Error('Failed to fetch barber details');
                const data = await response.json();
                setMember(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchBarber();
    }, [id]);

    if (loading) {
        return <div className="pt-32 text-center text-gray-500 min-h-screen">Loading barber details...</div>;
    }

    if (error || !member) {
        return <div className="pt-32 text-center text-red-500 min-h-screen">Barber not found.</div>;
    }

    const defaultImg = "";

    return (
        <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white pt-24">

            <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
                {/* Back Button */}
                <Link to="/team" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#C19D6C] mb-8 transition font-bold text-sm">
                    <ArrowLeft size={18} /> Back to Team
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">

                    {/* LEFT: IMAGE */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-3xl overflow-hidden aspect-square sm:aspect-[4/5] shadow-2xl bg-gray-100 w-full max-w-md mx-auto lg:max-w-none"
                    >
                        <img src={member.user_details?.profile_picture || defaultImg} alt={member.username} className="w-full h-full object-cover" />
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
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-[#0B0B0B] leading-tight">{member.username}</h1>
                            <p className="text-gray-600 text-base md:text-lg leading-relaxed">{member.bio || "Passionate about creating styles that define personality. Dedicated to the craft of grooming."}</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Responsibility</p>
                                <p className="font-bold text-lg">{member.job_title || "Stylist"}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Experience</p>
                                <p className="font-bold text-lg">{member.years_of_experience} Years</p>
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
                                From precision fades to timeless styles, {member.username} is where skill and style come together to give you the confidence you deserve. Highly rated by clients for attention to detail.
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


        </div>
    );
};

export default BarberDetails;
