import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const NotFoundPage = () => {
    return (
        <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white">

            {/* Hero / 404 Section */}
            <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center"></div>
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 text-center text-white px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-[12rem] md:text-[16rem] font-bold leading-none tracking-tighter shadow-xl drop-shadow-2xl">
                            4<span className="text-[#C19D6C]">0</span>4
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-xl md:text-2xl font-bold mb-8 text-gray-200 tracking-wide"
                    >
                        Looks like here is something missing!
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        <Link
                            to="/"
                            className="inline-block px-10 py-4 bg-[#C19D6C] text-[#1A1A1A] font-bold rounded-full hover:bg-[#a38355] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            Go Back Home
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default NotFoundPage;
