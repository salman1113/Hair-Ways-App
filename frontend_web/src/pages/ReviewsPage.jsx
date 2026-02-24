import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const ReviewsPage = () => {
    // API Data State (Empty placeholder for now)
    const reviews = [];
    return (
        <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white pt-20">

            {/* ================= 1. HERO SECTION ================= */}
            <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503951914875-befbb7470d03?q=80&w=1888&auto=format&fit=crop')] bg-cover bg-center bg-fixed"></div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 text-center text-white px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight"
                    >
                        Users review
                    </motion.h1>
                    {/* Decorative Line or Subtext could go here */}
                </div>
            </section>

            {/* ================= 2. REVIEWS GRID ================= */}
            <section className="py-24 bg-[#FAFAFA]">
                <div className="max-w-7xl mx-auto px-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {reviews.length === 0 ? (
                            <div className="text-center text-gray-500 py-12 col-span-2">No reviews available right now.</div>
                        ) : (
                            reviews.map((review, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className={`bg-white p-8 rounded-lg shadow-sm relative ${review.featured ? 'border-2 border-[#8B5CF6]' : 'border border-gray-100'}`}
                                >
                                    {/* Quote Icon */}
                                    <div className="absolute top-8 right-8 text-gray-200">
                                        <Quote size={40} fill="currentColor" />
                                    </div>

                                    {/* Stars */}
                                    <div className="flex gap-1 mb-6 text-[#C19D6C]">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} size={14} fill="currentColor" />
                                        ))}
                                    </div>

                                    {/* Text */}
                                    <p className="text-gray-600 mb-8 leading-relaxed">"{review.text}"</p>

                                    {/* User Info */}
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={review.image}
                                            alt={review.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold text-[#1A1A1A]">{review.name}</h4>
                                            <p className="text-xs text-[#C19D6C] font-bold uppercase tracking-wider">{review.role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                </div>
            </section>

            {/* ================= 3. CTA SECTION ================= */}
            <section className="relative py-32 bg-[#0B0B0B] overflow-hidden">
                {/* Background Image (Darkened) */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1888&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
                    <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full bg-white/5 backdrop-blur-sm mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#C19D6C] animate-pulse"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#C19D6C]">Call To Action</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                        Book your spot today & step out <br /> looking your best.
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/book" className="px-8 py-4 bg-[#C19D6C] text-[#1A1A1A] font-bold rounded-full hover:bg-white transition duration-300">
                            Book Your Slot
                        </Link>
                        <a href="mailto:info@hairways.com" className="flex items-center gap-2 text-white hover:text-[#C19D6C] transition font-medium">
                            <div className="p-2 border border-white/20 rounded-full">
                                <Quote size={14} className="rotate-180" /> {/* Just using as icon placeholder */}
                            </div>
                            info@hairways.com
                        </a>
                    </div>

                    <p className="mt-8 text-xs text-gray-500">
                        Book your slot through <span className="text-white font-bold">Google Calendar</span> or <span className="text-white font-bold">Apple Calendar</span>
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ReviewsPage;
