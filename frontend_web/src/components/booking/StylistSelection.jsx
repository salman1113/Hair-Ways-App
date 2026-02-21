import React from 'react';
import { Star } from 'lucide-react';

const StylistSelection = ({ employees, selectedEmployee, setSelectedEmployee }) => {

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Choose Stylist</h2>
                <p className="text-gray-500 text-sm">Select a professional for your service.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {employees.map(emp => {
                    const isSelected = selectedEmployee === emp.id;
                    return (
                        <div
                            key={emp.id}
                            onClick={() => setSelectedEmployee(emp.id)}
                            className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 flex flex-col items-center text-center
                    ${isSelected
                                    ? 'border-[#C19D6C] bg-white shadow-xl transform scale-105 z-10'
                                    : 'border-transparent bg-gray-50 hover:bg-white hover:shadow-md hover:border-gray-200'}`}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner text-xl font-bold uppercase
                         ${isSelected ? 'bg-[#1A1A1A] text-[#C19D6C]' : 'bg-gray-200 text-gray-500'}`}>
                                {emp.user_details?.username?.[0] || 'S'}
                            </div>

                            <h4 className="font-bold text-[#1A1A1A] px-2 w-full truncate">{emp.user_details?.username}</h4>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2 w-full truncate px-2">{emp.job_title}</p>

                            {/* Rating */}
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? 'text-[#C19D6C] bg-[#C19D6C]/10' : 'text-yellow-500 bg-yellow-50'}`}>
                                <Star size={10} fill="currentColor" /> {emp.rating || 5.0}
                            </div>

                            {isSelected && (
                                <div className="absolute top-3 right-3 w-3 h-3 bg-[#C19D6C] rounded-full shadow-sm ring-2 ring-white"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StylistSelection;
