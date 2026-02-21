import React from 'react';
import { Calendar, Sun, Moon } from 'lucide-react';

const TimeSelection = ({ date, setDate, time, setTime }) => {

    // Generate Time Slots based on time of day
    const morningSlots = ['09:00', '10:00', '11:00'];
    const afternoonSlots = ['12:00', '13:00', '14:00', '15:00', '16:00'];
    const eveningSlots = ['17:00', '18:00', '19:00', '20:00'];

    // Helper to handle time selection (supports single string or array)
    const isSelected = (slot) => {
        const current = Array.isArray(time) ? time[0] : time;
        return current === slot;
    };

    const TimeSlotButton = ({ slot }) => (
        <button key={slot} onClick={() => setTime(slot)}
            className={`py-2.5 rounded-xl text-sm font-bold transition-all
              ${isSelected(slot) ? 'bg-[#1A1A1A] text-[#C19D6C] shadow-md ring-2 ring-[#C19D6C]/30' : 'bg-gray-50 border border-gray-100 hover:border-[#C19D6C]/50 text-gray-600'}`}>
            {slot}
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Date & Time</h2>
                <p className="text-gray-500 text-sm">When should we expect you?</p>
            </div>

            {/* Date Picker */}
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl text-[#C19D6C] shadow-sm"><Calendar size={20} /></div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Select Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="bg-transparent font-bold text-[#1A1A1A] outline-none w-full cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-5">
                {/* Morning */}
                <div>
                    <p className="text-xs font-bold text-[#C19D6C] uppercase mb-2 flex items-center gap-2"><Sun size={14} /> Morning</p>
                    <div className="grid grid-cols-3 gap-3">
                        {morningSlots.map(slot => <TimeSlotButton key={slot} slot={slot} />)}
                    </div>
                </div>

                {/* Afternoon */}
                <div>
                    <p className="text-xs font-bold text-[#C19D6C] uppercase mb-2 flex items-center gap-2"><Sun size={14} /> Afternoon</p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {afternoonSlots.map(slot => <TimeSlotButton key={slot} slot={slot} />)}
                    </div>
                </div>

                {/* Evening */}
                <div>
                    <p className="text-xs font-bold text-[#C19D6C] uppercase mb-2 flex items-center gap-2"><Moon size={14} /> Evening</p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {eveningSlots.map(slot => <TimeSlotButton key={slot} slot={slot} />)}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TimeSelection;
