
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Star, CheckCircle, ArrowRight, ShieldCheck, UserCheck, Armchair, Plus, Minus, Instagram, Facebook, Twitter, MapPin, Mail, Phone } from 'lucide-react';
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

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
};


const AboutPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white overflow-x-hidden">

      {/* ================= 1. PAGE HEADER (Visual: "About salon" overlay) ================= */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover brightness-50" alt="Salon Background" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-8xl font-bold text-white tracking-tight"
          >
            About salon
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-center justify-center gap-4 mt-6 text-gray-300 text-sm font-medium tracking-widest uppercase"
          >
            <Link to="/" className="hover:text-[#C19D6C] transition">Home</Link>
            <span className="w-1 h-1 bg-[#C19D6C] rounded-full"></span>
            <span className="text-[#C19D6C]">About</span>
          </motion.div>
        </div>
      </section>


      {/* ================= 2. INTRO SECTION ("More than a cut") ================= */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Image with Badge */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeLeft}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-105 transition duration-700" />
            </div>
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full flex items-center justify-center p-2 shadow-xl hidden md:flex"
            >
              <div className="w-full h-full border-2 border-dashed border-[#C19D6C] rounded-full flex flex-col items-center justify-center text-center">
                <Scissors size={24} className="text-[#C19D6C] mb-1" />
                <span className="font-bold text-xs uppercase tracking-widest">Since 2015</span>
                <span className="text-[10px] text-gray-400">Premium Cuts</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Text Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.span variants={fadeInUp} className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs">Who We Are</motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold leading-tight text-[#1A1A1A]">
              More than a cut, it's an experience.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-600 text-lg leading-relaxed">
              We believe grooming is more than just a routine—it's a ritual. At Hair Ways, we combine traditional barbering techniques with modern style to give you the confidence you deserve.
            </motion.p>

            <div className="border-l-4 border-[#C19D6C] pl-6 py-2 bg-gray-50 rounded-r-lg">
              <h4 className="font-bold text-lg mb-1">Unique selling points</h4>
              <p className="text-sm text-gray-500">What sets us apart is our commitment to blending expert craftsmanship, modern style.</p>
            </div>

            <motion.button variants={fadeInUp} className="px-8 py-4 bg-[#C19D6C] hover:bg-[#a38355] text-white font-bold rounded-full transition shadow-lg hover:shadow-xl">
              Our Properties
            </motion.button>
          </motion.div>

        </div>
      </section>


      {/* ================= 3. FEATURES GRID ("Experience the art") ================= */}
      <section className="py-24 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block">Why Choose Us</span>
            <h2 className="text-4xl font-bold text-[#1A1A1A]">Experience the art of grooming</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: UserCheck, title: "Skilled Professionals", desc: "Our team of master barbers and stylists are experts in their craft." },
              { icon: ShieldCheck, title: "Premium Products", desc: "We use only high-quality grooming products to keep you looking fresh." },
              { icon: Scissors, title: "Personalized Service", desc: "Every client gets a bespoke experience, tailored to their unique style." },
              { icon: Armchair, title: "Comfortable", desc: "Relax in our luxe hygiene chairs designed for your comfort." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className={`p - 8 rounded - 3xl border border - gray - 100 transition duration - 300 hover: shadow - xl group ${idx === 1 || idx === 2 ? 'bg-[#1A1A1A] text-white' : 'bg-white text-black'} `}
              >
                <div className={`w - 14 h - 14 rounded - full flex items - center justify - center mb - 6 text - 2xl ${idx === 1 || idx === 2 ? 'bg-white/10 text-[#C19D6C]' : 'bg-[#C19D6C]/10 text-[#C19D6C]'} `}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#C19D6C] transition">{item.title}</h3>
                <p className={`text - sm leading - relaxed ${idx === 1 || idx === 2 ? 'text-gray-400' : 'text-gray-500'} `}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Central Image (Optional - visual balance) */}
          <div className="mt-16 rounded-3xl overflow-hidden h-96 relative hidden lg:block">
            <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Barber working" />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>
      </section>


      {/* ================= 4. JOURNEY TIMELINE ("Meet with our dope journey") ================= */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-between items-end mb-16"
          >
            <div>
              <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block">Our History</span>
              <h2 className="text-4xl font-bold max-w-md leading-tight">Meet with our dope & cool journey</h2>
            </div>
            <button className="hidden md:block px-6 py-3 border border-gray-200 rounded-full font-bold hover:bg-[#C19D6C] hover:border-[#C19D6C] hover:text-white transition">Get in Touch</button>
          </motion.div>

          <div className="relative">
            {/* Horizontal Scroll / Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { year: "2015", title: "The Beginning", desc: "Founded our first shop with just two chairs.", img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1000&auto=format&fit=crop" },
                { year: "2018", title: "Growing Roots", desc: "Expanded to a full-service salon.", img: "https://images.unsplash.com/photo-1503951914875-befbb7470d03?q=80&w=1000&auto=format&fit=crop" },
                { year: "2020", title: "New Chapter", desc: "Launched our own product line.", img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1000&auto=format&fit=crop" },
                { year: "2026", title: "Today", desc: "Now the finest grooming destination.", img: "https://images.unsplash.com/photo-1634480665986-ec0832d20387?q=80&w=1000&auto=format&fit=crop" }
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeInUp} className="group">
                  <div className="h-48 rounded-2xl overflow-hidden mb-6 relative">
                    <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 grayscale group-hover:grayscale-0" alt={item.title} />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {item.year}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#C19D6C] transition">{item.year} - {item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>


      {/* ================= 5. WORKING HOURS ("Look sharp, anytime") ================= */}
      <section className="py-24 bg-[#111111] text-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block p-1 px-3 border border-[#C19D6C] rounded-full w-fit mx-auto">Open Hours</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Look sharp, anytime <br /> working hours</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-16 border-b border-white/10 pb-16">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={i} className={`text - center p - 4 rounded - xl border ${i === 6 ? 'border-[#C19D6C] bg-[#C19D6C]/10' : 'border-white/10 bg-white/5'} hover: bg - [#C19D6C] hover: border - [#C19D6C] hover: text - white transition group cursor - pointer`}>
                <h4 className="font-bold text-lg mb-1 group-hover:text-black transition">{day}</h4>
                <p className={`text - xs uppercase tracking - wider group - hover: text - black transition ${i === 6 ? 'text-[#C19D6C]' : 'text-gray-400'} `}>
                  {i === 6 ? 'Closed' : '09:00 - 20:00'}
                </p>
              </div>
            ))}
          </div>

          {/* Large Relaxing Image */}
          <div className="rounded-3xl overflow-hidden h-[400px] md:h-[500px] relative shadow-2xl border border-white/10">
            <img src="https://images.unsplash.com/photo-1512690459411-b9245aed6191?q=80&w=2072&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Relaxing Wash" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <button className="px-8 py-3 bg-[#C19D6C] text-black font-bold rounded-full hover:bg-white transition">Book Your Visit</button>
            </div>
          </div>
        </div>
      </section>


      {/* ================= 6. FAQ SECTION ("Frequently asked questions") ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left: Image */}
          <div className="rounded-3xl overflow-hidden h-[600px] relative hidden lg:block">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" className="w-full h-full object-cover" alt="FAQ" />
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-6 rounded-2xl max-w-xs shadow-lg">
              <h4 className="font-bold text-lg mb-1">Got Questions?</h4>
              <p className="text-xs text-gray-500 mb-3">Our support team is here to help you 24/7.</p>
              <Link to="/contact" className="text-[#C19D6C] text-sm font-bold underline">Contact Support</Link>
            </div>
          </div>

          {/* Right: Accordion */}
          <div>
            <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block p-1 px-3 bg-[#C19D6C]/10 rounded-full w-fit">FAQ</span>
            <h2 className="text-4xl font-bold mb-12">Frequently asked questions</h2>

            <div className="space-y-4">
              {[
                { q: "What services does Hair Ways offer?", a: "We offer a full range of grooming services including haircuts, beard trims, hot towel shaves, hair coloring, and facials." },
                { q: "How can I book a service?", a: "You can book easily through our website by clicking the 'Book Appointment' button or by calling our front desk." },
                { q: "What are your opening hours?", a: "We are open Monday to Saturday from 9:00 AM to 8:00 PM. We are closed on Sundays." },
                { q: "Which payment methods do you accept?", a: "We accept all major credit cards, debit cards, cash, and digital payments like Apple Pay and Google Pay." },
                { q: "Are the services customizable?", a: "Absolutely! Our stylists will consult with you to tailor every service to your specific hair type and style preferences." },
                { q: "Are the products used safe?", a: "Yes, we prioritize your health and use only premium, dermatologically tested, and eco-friendly products." }
              ].map((item, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center text-left py-4 hover:text-[#C19D6C] transition"
                  >
                    <span className="font-bold text-lg">{item.q}</span>
                    {openFaq === idx ? <Minus size={20} className="text-[#C19D6C]" /> : <Plus size={20} className="text-gray-400" />}
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-500 pb-4 leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
};

export default AboutPage;