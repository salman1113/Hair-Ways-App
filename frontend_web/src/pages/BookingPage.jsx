import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getServices, getEmployees, createBooking } from '../services/api';
import { Loader2, ChevronRight, ChevronLeft, CheckCircle, Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Components
import ServiceSelection from '../components/booking/ServiceSelection';
import StylistSelection from '../components/booking/StylistSelection';
import TimeSelection from '../components/booking/TimeSelection';
import BookingSummary from '../components/booking/BookingSummary';

const BookingPage = () => {
  const navigate = useNavigate();

  // --- DATA STATES ---
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- WIZARD STATE ---
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // --- SELECTION STATES ---
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catData, srvData, empData] = await Promise.all([
          getCategories(), getServices(), getEmployees()
        ]);
        setCategories(catData);
        setServices(srvData);
        setEmployees(empData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load salon data");
      }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  // --- HANDLERS ---
  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedServices.length === 0) return toast.error("Please select at least one service! ✂️");
    if (step === 2 && !selectedEmployee) return toast.error("Please choose a stylist! 👤");
    if (step === 3 && (!date || !time)) return toast.error("Please pick a date and time! 📅");

    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading("Confirming your booking...");

    const cleanTime = Array.isArray(time) ? time[0] : time;
    const bookingPayload = {
      service_ids: selectedServices.map(id => Number(id)),
      employee: Number(selectedEmployee),
      booking_date: date,
      booking_time: String(cleanTime)
    };

    try {
      const response = await createBooking(bookingPayload);
      toast.success("Booking Confirmed! 🎉", { id: toastId });
      navigate('/success', { state: { booking: response } });
    } catch (error) {
      console.error("Booking Error:", error);
      let errorMsg = "Something went wrong.";

      if (error.response && error.response.data) {
        const errData = error.response.data;

        // Handle Suggestion Logic
        if (errData.suggested_time) {
          const suggestion = Array.isArray(errData.suggested_time) ? errData.suggested_time[0] : errData.suggested_time;
          errorMsg = `Slot busy! 😓 Try ${suggestion}?`;
          toast((t) => (
            <div className="flex flex-col gap-2">
              <span>Slot <b>{cleanTime}</b> is taken.</span>
              <span className="font-bold">Next available: {suggestion}</span>
              <button onClick={() => { setTime(suggestion); toast.dismiss(t.id); }}
                className="bg-[#C19D6C] text-black px-3 py-1 rounded-lg text-xs font-bold mt-1">
                Switch to {suggestion}
              </button>
            </div>
          ), { id: toastId, duration: 6000, icon: '⚠️' });
          return;
        }
        else if (errData.message) {
          errorMsg = errData.message;
        }
      }
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]"><Loader2 className="animate-spin text-[#C19D6C]" size={40} /></div>;

  return (
    <div className="bg-white min-h-screen">

      {/* 1. HERO SECTION */}
      <div className="relative h-[30vh] md:h-[40vh] flex items-center justify-center bg-black overflow-hidden mt-20 md:mt-0">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center"></div>
        <h1 className="relative z-10 text-4xl md:text-7xl font-bold text-white tracking-tight text-center px-4">Book Appointment</h1>
      </div>

      {/* 2. SPLIT LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

        {/* LEFT SIDE: Info */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 md:space-y-10 order-2 lg:order-1"
        >
          <div>
            <span className="text-[#C19D6C] font-bold uppercase tracking-widest text-xs mb-2 block">Premium Service</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] leading-tight">Get the look you love — <br className="hidden md:block" />schedule your visit.</h2>
            <p className="text-gray-600 mt-4 text-base md:text-lg leading-relaxed">Choose your preferred service and stylist. We are ready to make you shine with our expert grooming services.</p>
          </div>

          <div className="space-y-4 md:space-y-6 pt-4 border-t border-gray-100">
            <div className="flex gap-4 items-center group cursor-pointer">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FAFAFA] rounded-full flex items-center justify-center text-[#C19D6C] group-hover:bg-[#C19D6C] group-hover:text-white transition duration-300"><Phone size={20} className="md:w-6 md:h-6" /></div>
              <div><p className="font-bold text-[#1A1A1A] text-sm md:text-base">Phone</p><p className="text-gray-500 text-sm md:text-base">+91 98765 43210</p></div>
            </div>
            <div className="flex gap-4 items-center group cursor-pointer">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FAFAFA] rounded-full flex items-center justify-center text-[#C19D6C] group-hover:bg-[#C19D6C] group-hover:text-white transition duration-300"><MapPin size={20} className="md:w-6 md:h-6" /></div>
              <div><p className="font-bold text-[#1A1A1A] text-sm md:text-base">Address</p><p className="text-gray-500 text-sm md:text-base">Perambra, Calicut, Kerala</p></div>
            </div>
            <div className="flex gap-4 items-center group cursor-pointer">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FAFAFA] rounded-full flex items-center justify-center text-[#C19D6C] group-hover:bg-[#C19D6C] group-hover:text-white transition duration-300"><Clock size={20} className="md:w-6 md:h-6" /></div>
              <div><p className="font-bold text-[#1A1A1A] text-sm md:text-base">Opening Hours</p><p className="text-gray-500 text-sm md:text-base">Mon - Sun: 9:00 AM - 9:00 PM</p></div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: Booking Form Container (Black Box) */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-[#1A1A1A] p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden order-1 lg:order-2"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C19D6C] rounded-full mix-blend-overlay filter blur-[100px] opacity-20 pointer-events-none"></div>

          {/* Header */}
          <div className="mb-6 md:mb-8 flex justify-between items-end">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">Book Your Visit</h3>
              <p className="text-white/60 text-xs md:text-sm mt-1">Step {step} of 4</p>
            </div>
            {/* Progress Indicators */}
            <div className="flex gap-1.5 md:gap-2 mb-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-4 md:w-6 bg-[#C19D6C]' : 'w-1.5 md:w-2 bg-[#333]'}`}></div>
              ))}
            </div>
          </div>

          {/* WIZARD CONTENT - WRAPPED FOR DARK MODE */}
          <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 min-h-[350px] md:min-h-[400px] text-[#1A1A1A] shadow-inner mb-6 md:mb-8">
            {step === 1 && <ServiceSelection categories={categories} services={services} selectedServices={selectedServices} toggleService={toggleService} />}
            {step === 2 && <StylistSelection employees={employees} selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} />}
            {step === 3 && <TimeSelection date={date} setDate={setDate} time={time} setTime={setTime} />}
            {step === 4 && <BookingSummary services={services} selectedServices={selectedServices} selectedEmployee={selectedEmployee} employees={employees} date={date} time={time} />}
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-1 md:gap-2 font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-xl transition-all text-sm md:text-base
                            ${step === 1 ? 'text-[#333] cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-[#333]'}`}
            >
              <ChevronLeft size={18} className="md:w-5 md:h-5" /> Back
            </button>

            <button
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={submitting}
              className="bg-[#C19D6C] text-[#1A1A1A] px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold hover:bg-white hover:text-black transition shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> :
                step === 4 ? "Confirm" : "Next"}
              {!submitting && step < 4 && <ChevronRight size={18} className="md:w-5 md:h-5" />}
            </button>
          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default BookingPage;