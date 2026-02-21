import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

// --- DUMMY IMAGES ---
const galleryImages = [
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1888&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503951914875-befbb7470d03?q=80&w=1888&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512690459411-b9245aed1e3e?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1887&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593702295094-aea8cdd39d33?q=80&w=1887&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1634480484321-364585d6888c?q=80&w=2071&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1964&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534030347209-7147fd9e791a?q=80&w=1888&auto=format&fit=crop"
];

const GalleryPage = () => {
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
                    {galleryImages.map((src, index) => (
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
                    ))}
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default GalleryPage;
