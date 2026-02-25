import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, ShieldCheck, Star } from 'lucide-react';


const ServiceDetails = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/v1/services/services/${id}/`);
                if (!response.ok) throw new Error('Failed to fetch service details');
                const data = await response.json();
                setService(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    if (loading) {
        return <div className="pt-32 text-center text-gray-500 min-h-screen">Loading service details...</div>;
    }

    if (error || !service) {
        return <div className="pt-32 text-center text-red-500 min-h-screen">Service not found.</div>;
    }

    // Use a placeholder image since the backend currently doesn't have service.image
    const defaultImage = "https://images.unsplash.com/photo-1593702295094-aea8cdd39d33?q=80&w=1887&auto=format&fit=crop";

    return (
        <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white pt-24">

            {/* Container excluding Footer */}
            <div className="max-w-4xl mx-auto px-6 mb-24">

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl md:text-6xl font-bold text-center mb-12 tracking-tight"
                >
                    {service.name}
                </motion.h1>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl mb-16 bg-gray-100"
                >
                    <img src={defaultImage} alt={service.name} className="w-full h-full object-cover" />
                    {/* Decorative Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#3399FF] rounded-b-full"></div>
                </motion.div>

                {/* Quick Info Bar */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
                    <div className="flex items-center gap-2 bg-[#FAFAFA] px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                        <Clock className="text-[#C19D6C]" size={18} />
                        <span className="font-bold text-sm tracking-wide">{service.duration_minutes} MINS</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#FAFAFA] px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                        <span className="text-[#C19D6C] font-bold">₹</span>
                        <span className="font-bold text-sm tracking-wide">{service.price}</span>
                    </div>
                    {service.category_name && (
                        <div className="flex items-center gap-2 bg-[#FAFAFA] px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                            <CheckCircle className="text-[#C19D6C]" size={18} />
                            <span className="font-bold text-sm tracking-wide uppercase">{service.category_name}</span>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex flex-col gap-2">
                            <div className="w-12 h-1 bg-[#d033ff] rounded-full mb-4 mx-auto md:mx-0"></div>
                            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">Service Description</h3>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {service.description || "Experience our premium salon service. Our experts are dedicated to providing you with the highest quality grooming experience, ensuring you leave feeling confident and refreshed."}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Back Link */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-center flex items-center justify-center gap-4">
                    <Link to="/services" className="text-gray-500 font-bold hover:text-[#C19D6C] flex items-center gap-2 transition">
                        <ArrowLeft size={16} /> Back to Services
                    </Link>
                    <Link to="/book" className="px-6 py-3 bg-[#1A1A1A] text-white font-bold rounded-full hover:bg-[#C19D6C] transition shadow-md">
                        Book Now
                    </Link>
                </div>

            </div>


        </div>
    );
};

export default ServiceDetails;
