import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const GalleryPage = () => {
    // API Data State (Empty placeholder for now, integrate with API later)
    const galleryImages = [];
    return (
        <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white pt-24">

            <div className="max-w-7xl mx-auto px-6 mb-24">

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight"
                >
                    Shop overview
                </motion.h1>

                {/* Gallery Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {galleryImages.length === 0 ? (
                        <div className="text-center text-gray-400 py-12 block w-full">No gallery images available right now.</div>
                    ) : (
                        galleryImages.map((src, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="break-inside-avoid rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                            >
                                <img
                                    src={src}
                                    alt={`Gallery Image ${index + 1}`}
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </motion.div>
                        ))
                    )}
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default GalleryPage;
