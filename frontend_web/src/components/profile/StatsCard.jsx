import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-[#C19D6C]/20 flex items-center gap-5 transition hover:border-[#C19D6C]/50 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg ${color === 'bg-yellow-500' ? 'bg-[#C19D6C]' : 'bg-white'}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-[#C19D6C] transition-colors">{title}</p>
                <h3 className="text-2xl font-black text-white">{value}</h3>
            </div>
        </div>
    );
};

export default StatsCard;
