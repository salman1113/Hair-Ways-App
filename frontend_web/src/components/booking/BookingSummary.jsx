import React from 'react';
import { Calendar, Clock, User, Scissors, CheckCircle } from 'lucide-react';

const BookingSummary = ({ services, selectedServices, selectedEmployee, employees, date, time }) => {

    const selectedServiceDetails = services.filter(s => selectedServices.includes(s.id));
    const employeeDetails = employees.find(e => e.id === Number(selectedEmployee));
    const total = selectedServiceDetails.reduce((sum, s) => sum + Number(s.price), 0);
    const timeStr = Array.isArray(time) ? time[0] : time;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
                <div className="w-16 h-16 bg-[#C19D6C]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C19D6C]">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Looking Good!</h2>
                <p className="text-gray-500 text-sm">Review your details before confirming.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-6 relative overflow-hidden">
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C19D6C] rounded-full filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>

                {/* Date & Time */}
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-300 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-xl text-[#C19D6C] shadow-sm"><Calendar size={18} /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                            <p className="font-bold text-[#1A1A1A]">{date}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-[#1A1A1A]">
                            <Clock size={16} className="text-[#C19D6C]" /> <span className="font-black text-lg">{timeStr}</span>
                        </div>
                    </div>
                </div>

                {/* Stylist */}
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-[#1A1A1A] text-[#C19D6C] rounded-full flex items-center justify-center font-bold text-lg">
                        {employeeDetails?.user_details?.username?.[0] || "S"}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Stylist</p>
                        <h4 className="font-bold text-[#1A1A1A]">{employeeDetails?.user_details?.username}</h4>
                        <p className="text-xs text-gray-500">{employeeDetails?.job_title}</p>
                    </div>
                </div>

                {/* Services */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 relative z-10">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><Scissors size={12} /> Services</p>
                    <div className="space-y-2">
                        {selectedServiceDetails.map(service => (
                            <div key={service.id} className="flex justify-between text-sm">
                                <span className="text-gray-700 font-medium">{service.name}</span>
                                <span className="font-bold text-[#1A1A1A]">₹{service.price}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                        <span className="font-black text-gray-500 uppercase text-xs">Total Amount</span>
                        <span className="text-xl font-black text-[#C19D6C]">₹{total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSummary;
