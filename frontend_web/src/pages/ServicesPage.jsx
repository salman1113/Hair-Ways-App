import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors, CheckCircle, ArrowRight, Plus, Minus,
  Calendar, Clock, ShieldCheck, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
    transition: { staggerChildren: 0.2 }
  }
};

const ServicesPage = () => {
  // FAQ State
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white overflow-x-hidden">

      {/* ================= 1. HERO SECTION (Dark) ================= */}
      <section className="relative bg-[#0B0B0B] text-white py-32 overflow-hidden flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-[#0B0B0B]/80"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.p variants={fadeInUp} className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-4">
              World Class Grooming
            </motion.p>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Our Services
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-400 text-lg max-w-2xl mx-auto">
              From classic cuts to modern styling, we offer a comprehensive range of services designed to help you look and feel your absolute best.
            </motion.p>
          </motion.div>
        </div>
      </section>


      {/* ================= 2. SERVICE MENU (Split Layout) ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left: Sticky Image */}
          <div className="relative hidden lg:block h-fit sticky top-32">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img src="https://framerusercontent.com/images/reolu9KILYIFUr85jvwV43hcW8.png?width=1200&height=1600" className="w-full h-full object-cover" />

              {/* Floating Badge */}
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-black font-bold text-sm shadow-lg flex items-center gap-2">
                <Star size={16} className="text-[#C19D6C] fill-current" />
                Top Rated Service
              </div>
            </div>
          </div>

          {/* Right: Service List */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="space-y-4"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block">Our Expertise</span>
              <h2 className="text-4xl font-bold">A pure range of luxury <br />salon services</h2>
            </motion.div>

            {[
              { title: "Hair Wash & Treatment", desc: "Refreshing wash and care for stronger, healthy hair.", price: "$25" },
              { title: "Modern Styling", desc: "Trendy cuts tailored perfectly to match your style.", price: "$40" },
              { title: "Hot Towel Shaves", desc: "Relax with smooth, classic shaves every single time.", price: "$30" },
              { title: "Beard Trimming", desc: "Sharp, clean trims for a polished, bold look.", price: "$20" },
              { title: "Classic Haircuts", desc: "Classic barbering redefined with precision and confidence.", price: "$35" },
              { title: "Facial & Massage", desc: "Rejuvenating facial treatments for glowing skin.", price: "$50" }
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group p-8 bg-[#FAFAFA] rounded-2xl hover:bg-[#0B0B0B] hover:text-white transition-all duration-500 cursor-pointer border border-gray-100 hover:border-[#0B0B0B]"
              >
                <Link to={`/services/${index + 1}`} className="block w-full h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold group-hover:text-[#C19D6C] transition-colors">{service.title}</h3>
                    <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 text-[#C19D6C]" />
                  </div>
                  <p className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors mb-4">{service.desc}</p>
                  <div className="w-full h-[1px] bg-gray-200 group-hover:bg-white/10 transition-colors"></div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ================= 3. WHY CHOOSE US (Features) ================= */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Image (Swapped position) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl order-2 lg:order-1"
          >
            <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1888&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-105 transition duration-700" />
          </motion.div>

          {/* Right: Content (Swapped position) */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="space-y-8 order-1 lg:order-2"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C19D6C]/10 text-[#C19D6C] text-xs font-bold uppercase tracking-wider w-fit">
              Why Choose Us
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold leading-tight">
              Experience the art of grooming with unmatched care.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-600">
              At our barber shop, we don't just cut hair—we craft confidence. Every service is designed to give you a sharp look while making your experience comfortable and enjoyable.
            </motion.p>

            <div className="space-y-4">
              {[
                { title: "Skilled Professionals", desc: "Experienced barbers who know both classic and modern styles." },
                { title: "Attention to Detail", desc: "A friendly, welcoming space where you can unwind." },
                { title: "Relaxing Atmosphere", desc: "Precision cuts, fades, and grooming tailored to your look." },
              ].map((item, idx) => (
                <motion.div variants={fadeInUp} key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                  <CheckCircle className="text-[#C19D6C] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>


      {/* ================= 4. CTA BANNER ================= */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto relative rounded-[3rem] overflow-hidden h-[400px] flex items-center justify-center text-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-black/70"></div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="relative z-10 max-w-2xl px-6"
          >
            <motion.span variants={fadeInUp} className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold text-[#C19D6C] uppercase tracking-widest border border-white/10">
              Call to Action
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mt-6 mb-8 leading-tight">
              Book your spot today & step out looking your best.
            </motion.h2>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book" className="px-8 py-4 bg-[#C19D6C] text-black font-bold rounded-xl hover:bg-white transition duration-300">
                Book Your Slot
              </Link>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 hover:bg-white hover:text-black transition duration-300">
                info@hairways.com
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* ================= 5. FAQ SECTION (Refined Layout) ================= */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl hidden lg:block"
          >
            <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700" />

            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">Expert Answers</h3>
              <p className="text-sm text-gray-500">Find out everything you need to know about our premium services.</p>
            </div>
          </motion.div>

          {/* Right: FAQ Content */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          >
            <div className="mb-10">
              <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block">FAQ's</span>
              <h2 className="text-4xl font-bold mb-4">Frequently asked questions</h2>
              <p className="text-gray-600">Got questions? We've got answers. If you can't find what you're looking for, feel free to contact us.</p>
            </div>

            <div className="space-y-4">
              {[
                { q: "What services does Hair Ways offer?", a: "We offer a wide range of services including haircuts, beard trims, hot towel shaves, facials, and hair coloring treatments tailored to your style." },
                { q: "How can I book a service?", a: "You can book easily through our website by clicking the 'Book Now' button, selecting your service, stylist, and preferred time slot." },
                { q: "What are your opening hours?", a: "We are open from 9:00 AM to 9:00 PM from Monday to Saturday, and 10:00 AM to 6:00 PM on Sundays." },
                { q: "Do you accept walk-ins?", a: "Yes, walk-ins are welcome! However, we highly recommend booking an appointment to ensure you don't have to wait." },
                { q: "Are the products used safe?", a: "Absolutely. We use only premium, organic, and dermatologically tested products to ensure safety and quality for our clients." },
              ].map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition"
                  >
                    <span className="font-bold text-lg text-[#1A1A1A]">{item.q}</span>
                    <div className={`p-2 rounded-full transition-colors ${activeFaq === idx ? 'bg-[#C19D6C] text-white' : 'bg-gray-100 text-black'}`}>
                      {activeFaq === idx ? <Minus size={18} /> : <Plus size={18} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 text-gray-500 leading-relaxed border-t border-gray-100">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= 5. FOOTER ================= */}
      <Footer />

    </div>
  );
};

export default ServicesPage;