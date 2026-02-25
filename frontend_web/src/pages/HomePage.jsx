import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Phone, ArrowRight, Scissors, CheckCircle, Calendar, User, MapPin, Instagram, Facebook, Twitter, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [servicesRes, teamRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/services/services/'),
          fetch('http://localhost:8000/api/v1/accounts/employees/')
        ]);
        if (servicesRes.ok) {
          const sData = await servicesRes.json();
          setServices(sData.slice(0, 4));
        }
        if (teamRes.ok) {
          const tData = await teamRes.json();
          setTeam(tData.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="font-sans text-[#1A1A1A] antialiased bg-white selection:bg-[#C19D6C] selection:text-white overflow-x-hidden">

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative min-h-screen flex items-center bg-[#0B0B0B] text-white overflow-hidden">

        {/* ABSOLUTE HERO IMAGE (Right Side - Blended) */}
        <div className="absolute top-0 md:top-18 right-0 w-full lg:w-[60%] h-full z-10 block opacity-50 lg:opacity-90">
          <img
            src="/IMG_6803.PNG"
            className="w-full h-full object-cover object-center"
            alt="Hero Model"
          />
          {/* Gradient Overlays for smooth blending */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/70 lg:via-[#0B0B0B]/40 to-transparent"></div>
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

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4 mt-8">
              <Link to="/book" className="px-8 py-4 bg-[#C19D6C] hover:bg-[#a38355] text-black font-bold text-base rounded-full transition flex items-center justify-center gap-2 group w-full sm:w-auto">
                Book Your Spot <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
              <div className="flex items-center gap-3 px-6 py-4 border border-white/20 bg-white/5 rounded-full hover:bg-white/10 transition cursor-pointer justify-center w-full sm:w-auto">
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
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: item.delay } }
                }}
                className={`relative rounded-3xl overflow-hidden group h-[300px] md:h-[400px] lg:h-full ${idx === 1 ? 'md:mt-12' : ''}`}
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
            className="relative rounded-3xl overflow-hidden h-[400px] md:h-[600px] shadow-2xl group w-full"
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
              {services.length === 0 ? (
                <p className="text-gray-500">No services available right now.</p>
              ) : (
                services.map((service) => (
                  <motion.div
                    key={service.id}
                    variants={fadeInUp}
                    className="group p-6 bg-white rounded-2xl hover:shadow-xl transition border border-gray-100 cursor-pointer hover:border-[#C19D6C]/30"
                  >
                    <Link to={`/services/${service.id}`} className="block w-full h-full">
                      <h3 className="text-xl font-bold text-black group-hover:text-[#C19D6C] transition flex justify-between items-center">
                        {service.name}
                        <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition text-[#C19D6C]" />
                      </h3>
                      <p className="text-gray-500 mt-2 text-sm group-hover:text-gray-600 transition truncate">{service.description || "Premium styling service."}</p>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>

            <motion.div variants={fadeInUp} className="mt-8 text-center lg:text-left">
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
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-500"></div>
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-black leading-none">VIP Clients</p>
                <p className="text-[10px] text-[#C19D6C] font-bold uppercase tracking-widest">Hair Ways</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Masonry Gallery Grid Empty */}
        <div className="max-w-7xl mx-auto px-6 mt-16 text-center text-gray-400">
          <p className="text-sm tracking-widest uppercase">Live Gallery Feed (Currently empty, integrate with API)</p>
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
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-8">
              Book your spot today <br className="hidden md:block" /> & step out looking your best.
            </motion.h2>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book" className="px-8 py-4 bg-[#C19D6C] text-black font-bold rounded-full hover:bg-white transition flex items-center justify-center w-full sm:w-auto">Book Your Spot</Link>
              <button className="px-8 py-4 bg-transparent border border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition w-full sm:w-auto">Contact Us</button>
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
            {team.length === 0 ? (
              <p className="text-gray-500 col-span-4 text-center">No stylists available right now.</p>
            ) : (
              team.map((member) => (
                <motion.div key={member.id} variants={fadeInUp} className="group cursor-pointer">
                  <Link to={`/team/${member.id}`}>
                    <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4] bg-gray-100">
                      <img src={member.user_details?.profile_picture || ""} className="w-full h-full object-cover group-hover:scale-110 transition duration-500 grayscale group-hover:grayscale-0" alt={member.username} />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition"></div>
                    </div>
                    <h3 className="font-bold text-lg">{member.username}</h3>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{member.job_title || "Stylist"}</p>
                  </Link>
                </motion.div>
              ))
            )}
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
            <p className="text-gray-500 col-span-2 text-center py-12">No blog posts available.</p>
          </motion.div>
        </div>
      </section>

      {/* ================= 8. FOOTER ================= */}

    </div>
  );
};

export default HomePage;