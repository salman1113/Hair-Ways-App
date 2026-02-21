import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Phone, ArrowRight, Scissors, CheckCircle, Calendar, User, MapPin, Instagram, Facebook, Twitter, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
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

const HomePage = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white overflow-x-hidden">

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative min-h-screen flex items-center bg-[#0B0B0B] text-white overflow-hidden">

        {/* ABSOLUTE HERO IMAGE (Right Side - Blended) */}
        <div className="absolute top-18 right-0 w-full lg:w-[60%] h-full z-10 block">
          <img
            src="/IMG_6803.PNG"
            className="w-full h-full object-cover object-center opacity-90"
            alt="Hero Model"
          />
          {/* Gradient Overlays for smooth blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B0B0B] to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full relative z-30">

          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C19D6C]/30 bg-[#C19D6C]/10 text-[#C19D6C] text-xs font-bold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-[#C19D6C] animate-pulse"></span>
              5% Off for your first visit
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
              Sharp cuts, <br />
              <span className="text-gray-500">smooth shaves,</span> <br />
              timeless style.
            </motion.h1>

            <motion.div variants={fadeInUp} className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} className="w-10 h-10 rounded-full border-2 border-black" alt="Client" />
                ))}
              </div>
              <div>
                <div className="flex text-[#C19D6C] gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  <Link to="/reviews" className="hover:text-[#C19D6C] transition-colors">Loved by 10k+ trusted clients</Link>
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/book" className="px-8 py-4 bg-[#C19D6C] hover:bg-[#a38355] text-black font-bold text-base rounded-full transition flex items-center justify-center gap-2 group">
                Book Your Spot <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
              <div className="flex items-center gap-3 px-6 py-4 border border-white/10 rounded-full hover:bg-white/5 transition cursor-pointer">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Phone size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Call for query</p>
                  <p className="text-sm font-bold">+91 98765 43210</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column Spacer (Image is now absolute background) */}
          <div className="hidden lg:block h-full min-h-[500px]"></div>

        </div>
      </section>


      {/* ================= 2. INTRO / MASONRY ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block px-3 py-1 bg-[#C19D6C]/10 rounded-full w-fit mx-auto">About Salon</span>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
              Barbershop, grooming is more than just a service—it’s an experience.
            </h2>
          </motion.div>

          {/* Grid Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[500px]">
            {[
              { img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop", title: "Premium Tools", delay: 0 },
              { img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop", title: "Expert Styling", delay: 0.2 },
              { img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1888&auto=format&fit=crop", title: "Relaxing Ambience", delay: 0.4 }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: item.delay } }
                }}
                className={`relative rounded-3xl overflow-hidden group h-[400px] md:h-full ${idx === 1 ? 'md:mt-12' : ''}`}
              >
                <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-6">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-full w-fit mb-2">
                    <Scissors size={20} className="text-white" />
                  </div>
                  <p className="text-white font-bold text-xl">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ================= 3. SERVICES LIST ================= */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeLeft}
            className="relative rounded-3xl overflow-hidden h-[600px] shadow-2xl group"
          >
            <img src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="Services" />
            <div className="absolute top-6 left-6 bg-white px-4 py-2 rounded-full text-sm font-bold text-black shadow-lg flex items-center gap-2">
              <CheckCircle size={16} className="text-[#C19D6C]" /> Our Expertise
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block">Our Services</motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-black mb-8">A pure range of luxury salon services.</motion.h2>

            <div className="space-y-4">
              {[
                { title: "Hair Wash & Treatment", desc: "Refreshing wash and care for stronger, healthy hair." },
                { title: "Modern Styling", desc: "Trendy cuts tailored perfectly to match your style." },
                { title: "Hot Towel Shaves", desc: "Relax with smooth, classic shaves every single time." },
                { title: "Beard Trimming", desc: "Sharp, clean trims for a polished, bold look." }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group p-6 bg-white rounded-2xl hover:shadow-xl transition border border-gray-100 cursor-pointer hover:border-[#C19D6C]/30"
                >
                  <h3 className="text-xl font-bold text-black group-hover:text-[#C19D6C] transition flex justify-between items-center">
                    {service.title}
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition text-[#C19D6C]" />
                  </h3>
                  <p className="text-gray-500 mt-2 text-sm group-hover:text-gray-600 transition">{service.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeInUp} className="mt-8">
              <Link to="/services" className="text-black font-bold border-b-2 border-black pb-1 hover:text-[#C19D6C] hover:border-[#C19D6C] transition">See All Services</Link>
            </motion.div>
          </motion.div>

        </div>
      </section>


      {/* ================= 4. TESTIMONIAL & GALLERY ================= */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="flex gap-1 justify-center text-[#C19D6C] mb-8">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-10 text-gray-900">
              “Exceptional service, clean cuts, and <br /> a welcoming barbershop atmosphere <br /> always.”
            </h2>

            {/* User Pill */}
            <div className="inline-flex items-center gap-4 bg-[#F5F5F5] pr-6 pl-2 py-2 rounded-full mb-8">
              <div className="flex -space-x-3">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="User" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-black leading-none">Michael</p>
                <p className="text-[10px] text-[#C19D6C] font-bold uppercase tracking-widest">VIP Guest</p>
              </div>
              <div className="flex -space-x-2 ml-2 opacity-50 grayscale scale-75">
                <img src="https://randomuser.me/api/portraits/men/44.jpg" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-8 h-8 rounded-full border-2 border-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Masonry Gallery Grid */}
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">

            {/* Column 1 */}
            <div className="flex flex-col gap-4 md:gap-8 translate-y-8 md:translate-y-0">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="rounded-3xl overflow-hidden h-64 md:h-80"
              >
                <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition duration-700" alt="Gallery 1" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="rounded-3xl overflow-hidden h-64 md:h-80"
              >
                <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition duration-700" alt="Gallery 2" />
              </motion.div>
            </div>

            {/* Column 2 (Center) */}
            <div className="flex flex-col gap-4 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="rounded-3xl overflow-hidden h-[400px] md:h-[500px]"
              >
                <img src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition duration-700" alt="Gallery 3" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="rounded-3xl overflow-hidden h-48 md:h-60"
              >
                <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1888&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition duration-700" alt="Gallery 4" />
              </motion.div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4 md:gap-8 translate-y-8 md:translate-y-12">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="rounded-3xl overflow-hidden h-56 md:h-64"
              >
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition duration-700" alt="Gallery 5" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="rounded-3xl overflow-hidden h-72 md:h-96"
              >
                <img src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition duration-700" alt="Gallery 6" />
              </motion.div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= 5. CTA BANNER ================= */}
      <section className="relative py-32 bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1512690459411-b9245aed6191?q=80&w=2072&auto=format&fit=crop" className="w-full h-full object-cover" alt="Banner" />
        </div>
        <div className="relative z-10 text-center max-w-2xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-block px-4 py-1 border border-[#C19D6C] text-[#C19D6C] rounded-full text-xs font-bold uppercase mb-4">
              Book With Us
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-8">
              Book your spot today & step out looking your best.
            </motion.h2>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book" className="px-8 py-3 bg-[#C19D6C] text-black font-bold rounded-full hover:bg-white transition">Book Your Spot</Link>
              <button className="px-8 py-3 bg-transparent border border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition">Contact Us</button>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* ================= 6. TEAM / EXPERTS ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="flex flex-col md:flex-row justify-between items-end mb-12"
          >
            <div>
              <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block">Our Team</span>
              <h2 className="text-4xl font-bold">Meet the Experts</h2>
            </div>
            <Link to="/about" className="hidden md:block px-6 py-3 border border-gray-200 rounded-full font-bold hover:bg-black hover:text-white transition mt-4 md:mt-0">View All Members</Link>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { name: "Damian R. Cole", role: "Hair Colorist", img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1887&auto=format&fit=crop" },
              { name: "Nathan Parker", role: "Grooming Expert", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop" },
              { name: "Emilio Harper", role: "Bridal Stylist", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
              { name: "Adrian Fulton", role: "Senior Stylist", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop" }
            ].map((member, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4]">
                  <img src={member.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-500 grayscale group-hover:grayscale-0" alt={member.name} />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition"></div>
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ================= 7. BLOG / INSIGHTS ================= */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block border border-[#C19D6C] rounded-full w-fit mx-auto px-3 py-1">Blog & Insights</span>
            <h2 className="text-4xl font-bold">Salon update & insights</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
          >
            {[
              { title: "Everyday Haircare Routine...", date: "Feb 06, 2026", img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1000&auto=format&fit=crop" },
              { title: "The Power of a Great Haircut...", date: "Feb 01, 2026", img: "https://images.unsplash.com/photo-1503951914875-befbb7470d03?q=80&w=1000&auto=format&fit=crop" },
              { title: "Refresh Your Style: Haircare Tips...", date: "Jan 28, 2026", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000&auto=format&fit=crop" },
              { title: "Top Salon Trends You Need to Know", date: "Jan 15, 2026", img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1000&auto=format&fit=crop" }
            ].map((post, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-white p-4 rounded-3xl flex items-center gap-6 hover:shadow-xl transition group cursor-pointer">
                <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={post.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Blog" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">
                    <Calendar size={12} /> {post.date}
                  </div>
                  <h3 className="font-bold text-xl group-hover:text-[#C19D6C] transition">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">Discover the secrets to maintaining your perfect look every single day with our expert tips...</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= 8. FOOTER ================= */}
      <Footer />

    </div>
  );
};

export default HomePage;