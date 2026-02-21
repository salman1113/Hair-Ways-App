import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Home, Download } from 'lucide-react';
import { generateTicketPDF } from '../utils/ticketGenerator';
import confetti from 'canvas-confetti';

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (booking) {
      // Trigger Confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#C19D6C', '#FFFFFF', '#FFD700'] }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#C19D6C', '#FFFFFF', '#FFD700'] }));
      }, 250);

      // Fade in content
      setTimeout(() => setShowContent(true), 500);
    }
  }, [booking]);

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0B0B] p-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">No booking data found.</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#C19D6C] text-black rounded-xl font-bold hover:bg-white transition">Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] py-10 px-4 flex flex-col items-center justify-center relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#C19D6C] rounded-full mix-blend-screen filter blur-[120px] opacity-15 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#C19D6C] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} w-full max-w-md`}>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#C19D6C] rounded-full text-black shadow-2xl mb-4 animate-bounce-short">
            <CheckCircle size={40} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400">Get ready to look your best.</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-[#1A1A1A] rounded-3xl shadow-2xl overflow-hidden relative border border-[#333]">
          {/* Ticket Notch (Visual) */}
          <div className="absolute top-1/2 left-0 w-6 h-6 bg-[#0B0B0B] rounded-full -translate-x-3 -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-6 h-6 bg-[#0B0B0B] rounded-full translate-x-3 -translate-y-1/2"></div>

          <div className="p-8 border-b-2 border-dashed border-[#333]">
            <div className="text-center">
              <p className="text-xs font-bold text-[#C19D6C] uppercase tracking-widest mb-1">Queue Token</p>
              <h2 className="text-6xl font-black text-white">{booking.token_number}</h2>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#C19D6C]/10 text-[#C19D6C] rounded-lg"><Calendar size={18} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Date</p>
                  <p className="font-bold text-white text-lg">{booking.booking_date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#C19D6C]/10 text-[#C19D6C] rounded-lg"><Clock size={18} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Time</p>
                  <p className="font-bold text-white text-lg">{booking.booking_time}</p>
                </div>
              </div>
            </div>

            {/* Stylist */}
            <div className="flex items-center gap-4 bg-[#0B0B0B] p-4 rounded-xl border border-[#333]">
              <div className="w-12 h-12 bg-[#C19D6C] rounded-full flex items-center justify-center text-black font-bold text-lg">
                {booking.employee_details?.user_details?.username?.[0] || 'S'}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Stylist</p>
                <p className="font-bold text-white text-lg">{booking.employee_details?.user_details?.username}</p>
                <p className="text-xs text-gray-500">{booking.employee_details?.job_title}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-[#0B0B0B] flex gap-3 border-t border-[#333]">
            <button
              onClick={() => generateTicketPDF(booking)}
              className="flex-1 py-3 bg-[#1A1A1A] border border-[#333] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:border-[#C19D6C] transition"
            >
              <Download size={18} /> Save Ticket
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 bg-[#C19D6C] text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition shadow-lg"
            >
              <Home size={18} /> Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingSuccessPage;