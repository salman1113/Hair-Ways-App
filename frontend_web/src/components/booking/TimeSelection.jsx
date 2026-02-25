import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';

const TimeSelection = ({ date, setDate, time, setTime }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Generate 30-Minute Time Slots
    const generateTimeSlots = () => {
        const slots = [];
        for (let h = 9; h <= 20; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`);
            // Only add 20:30 if h is 20, otherwise add for all other hours
            if (h < 20 || (h === 20 && '20:30' <= '20:30')) { // Ensure 20:30 is included but not 20:60
                slots.push(`${h.toString().padStart(2, '0')}:30`);
            }
        }
        return slots;
    };

    const allSlots = generateTimeSlots();

    // Helper to format 24-hour time to 12-hour AM/PM for Display
    const formatTo12Hour = (time24) => {
        if (!time24) return '';
        const [hourStr, minStr] = time24.split(':');
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; // '0' should be '12'
        return `${hour}:${minStr} ${ampm}`;
    };

    // Helper to handle time selection
    const isSelected = (slot) => {
        const current = Array.isArray(time) ? time[0] : time;
        return current === slot;
    };

    // Strict Temporal Validation for Today
    const isSlotPassed = (slot) => {
        if (!date) return false;
        const today = new Date();
        const selectedDate = new Date(date);

        // Exact Date Match (Today)
        if (selectedDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
            const [slotHour, slotMinute] = slot.split(':').map(Number);
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            if (slotHour < currentHour) return true;
            if (slotHour === currentHour && slotMinute <= currentMinute) return true;
        }
        return false;
    };

    const handleTimeSelect = (slot) => {
        if (!isSlotPassed(slot)) {
            setTime(slot);
            setIsDropdownOpen(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Date & Time</h2>
                <p className="text-gray-500 text-sm">When should we expect you?</p>
            </div>

            {/* Date Picker */}
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-200">
                <div className="flex items-center gap-3 w-full">
                    <div className="bg-white p-2.5 rounded-xl text-[#C19D6C] shadow-sm"><Calendar size={20} /></div>
                    <div className="w-full">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Select Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setTime(''); // Auto reset chosen time if dates switch
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            className="bg-transparent font-bold text-[#1A1A1A] outline-none w-full cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Sleek Custom Dropdown Select */}
            <div className="relative">
                <div
                    className={`bg-gray-50 p-4 rounded-2xl flex items-center justify-between border transition-all ${!date ? 'opacity-60 cursor-not-allowed border-gray-200' : 'cursor-pointer border-gray-200 hover:border-[#C19D6C]/50'} ${isDropdownOpen ? 'ring-2 ring-[#C19D6C]/30' : ''}`}
                    onClick={() => date && setIsDropdownOpen(!isDropdownOpen)}
                >
                    <div className="flex items-center gap-3 w-full">
                        <div className="bg-white p-2.5 rounded-xl text-[#C19D6C] shadow-sm"><Clock size={20} /></div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Select Time</label>
                            <div className="font-bold text-[#1A1A1A] mt-0.5">
                                {!date ? 'Please Select Date First' : (time ? formatTo12Hour(time) : 'Choose Time Slot')}
                            </div>
                        </div>
                    </div>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#C19D6C]' : ''}`} />
                </div>

                {/* Dropdown Menu Overlay */}
                {isDropdownOpen && date && (
                    <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-white border border-gray-100/80 rounded-2xl shadow-2xl z-20 
                                    max-h-64 overflow-y-auto custom-scrollbar animate-fade-in-up origin-top">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {allSlots.map(slot => {
                                const disabled = isSlotPassed(slot);
                                const selected = isSelected(slot);
                                return (
                                    <button
                                        key={slot}
                                        onClick={() => handleTimeSelect(slot)}
                                        disabled={disabled}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all
                                          ${disabled ? 'bg-gray-50/50 text-gray-300 cursor-not-allowed opacity-50 border border-transparent' :
                                                selected ? 'bg-[#1A1A1A] text-[#C19D6C] shadow-md ring-1 ring-[#C19D6C]/30' :
                                                    'bg-white border border-gray-100 hover:border-[#C19D6C]/40 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {formatTo12Hour(slot)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default TimeSelection;
