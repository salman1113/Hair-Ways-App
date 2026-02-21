import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, ShieldCheck, Star } from 'lucide-react';
import Footer from '../components/Footer';

// --- DUMMY DATA ---
const servicesData = [
    {
        id: 1,
        title: "Hair Wash & Treatment",
        desc: "Refreshing wash and care for stronger, healthy hair.",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop",
        details: [
            { title: "Refreshing Hair Wash", desc: "Start your salon experience with a soothing hair wash that cleanses your scalp and strands thoroughly. Using premium shampoos tailored to your hair type, we remove impurities, excess oil, and buildup, leaving your hair fresh and revitalized." },
            { title: "Nourishing Treatments", desc: "After cleansing, we apply customized treatments designed to address your hair's unique needs—whether it's hydration, repair, frizz control, or strengthening. Our professional-grade products penetrate deeply to restore shine, softness, and health." },
            { title: "Scalp Care & Relaxation", desc: "Our hair treatments include a gentle scalp massage to improve circulation, relax muscles, and promote healthy hair growth. This calming ritual enhances both your physical comfort and overall wellness." },
            { title: "Deep Conditioning & Finishing", desc: "To seal in moisture and enhance manageability, we finish with a deep conditioning treatment. Your hair will feel soft, silky, and resilient, ready for styling or a natural, effortless look." },
            { title: "Expert Hair Advice", desc: "We provide personalized guidance on maintaining healthy hair at home, including product recommendations, styling tips, and routines to keep your hair looking salon-fresh between visits." }
        ]
    },
    {
        id: 2,
        title: "Modern Styling",
        desc: "Trendy cuts tailored perfectly to match your style.",
        image: "https://images.unsplash.com/photo-1593702295094-aea8cdd39d33?q=80&w=1887&auto=format&fit=crop",
        details: [
            { title: "Consultation & Style Analysis", desc: "We start with a thorough consultation to understand your preferences, face shape, and hair type, recommending the best modern styles for you." },
            { title: "Precision Cutting", desc: "Using advanced cutting techniques, we sculpt your hair to achieve the desired look, whether it's a fade, undercut, or textured crop." },
            { title: "Styling & Finish", desc: "We finish the look with premium styling products to add texture, hold, and shine, ensuring your style lasts all day." }
        ]
    },
    {
        id: 3,
        title: "Hot Towel Shaves",
        desc: "Relax with smooth, classic shaves every single time.",
        image: "https://images.unsplash.com/photo-1503951914875-befbb7470d03?q=80&w=1888&auto=format&fit=crop",
        details: [
            { title: "Pre-Shave Preparation", desc: "We prepare your skin with hot towels and pre-shave oil to soften the beard and open pores for a smoother shave." },
            { title: "Classic Straight Razor Shave", desc: "Experience the closeness of a traditional straight razor shave, performed with precision and care." },
            { title: "Post-Shave Treatment", desc: "We finish with a cold towel to close pores and apply soothing aftershave balm to hydrate and protect your skin." }
        ]
    },
    {
        id: 4,
        title: "Beard Trimming",
        desc: "Sharp, clean trims for a polished, bold look.",
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop",
        details: [
            { title: "Shape & Sculpt", desc: "We define the lines of your beard to enhance your facial features and maintain a neat appearance." },
            { title: "Trimming & Thinning", desc: "We carefully trim length and bulk to ensure an even, well-groomed beard." },
            { title: "Beard Oil Application", desc: "A nourishing beard oil application leaves your beard soft, shiny, and smelling great." }
        ]
    },
    {
        id: 5,
        title: "Classic Haircuts",
        desc: "Classic barbering redefined with precision and confidence.",
        image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1888&auto=format&fit=crop",
        details: [
            { title: "Traditional Techniques", desc: "Focusing on timeless styles like the pompadour, side part, and crew cut." },
            { title: "Scissor Over Comb", desc: "Masterful scissor work for a soft, natural finish." },
            { title: "Neck Shave", desc: "A clean neck shave finishes the cut for a sharp, tailored look." }
        ]
    },
    {
        id: 6,
        title: "Facial & Massage",
        desc: "Rejuvenating facial treatments for glowing skin.",
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
        details: [
            { title: "Deep Cleansing", desc: "Removing dirt and impurities to reveal fresh, clear skin." },
            { title: "Exfoliation", desc: "Gentle exfoliation removes dead skin cells and promotes cell turnover." },
            { title: "Relaxing Massage", desc: "A facial massage releases tension and improves circulation for a healthy glow." }
        ]
    }
];

const ServiceDetails = () => {
    const { id } = useParams();
    const service = servicesData.find(s => s.id === parseInt(id)) || servicesData[0];

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
                    {service.title}
                </motion.h1>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl mb-16"
                >
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                    {/* Decorative Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#3399FF] rounded-b-full"></div>
                </motion.div>

                {/* Details List */}
                <div className="space-y-12">
                    {service.details.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex flex-col gap-2">
                                {/* Optional Divider for visuals */}
                                {index === 0 && <div className="w-12 h-1 bg-[#d033ff] rounded-full mb-4 mx-auto md:mx-0"></div>}

                                <h3 className="text-xl font-bold text-[#1A1A1A]">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Back Link */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <Link to="/services" className="text-[#C19D6C] font-bold hover:underline">View All Services</Link>
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default ServiceDetails;
