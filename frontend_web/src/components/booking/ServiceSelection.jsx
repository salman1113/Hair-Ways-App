import React, { useState, useEffect } from 'react';
import { Scissors, CheckCircle } from 'lucide-react';

const ServiceSelection = ({ categories, services, selectedServices, toggleService }) => {
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0].id);
        }
    }, [categories]);

    const handleToggle = (id) => {
        toggleService(id);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Select Services</h2>
                <p className="text-gray-500 text-sm">Choose the treatments you'd like today.</p>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0
            ${activeCategory === cat.id ? 'bg-[#1A1A1A] text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.filter(s => s.category === activeCategory).map(service => {
                    const isSelected = selectedServices.includes(service.id);
                    return (
                        <div
                            key={service.id}
                            onClick={() => handleToggle(service.id)}
                            className={`p-5 rounded-2xl cursor-pointer flex justify-between items-center transition-all duration-300 border-2
                    ${isSelected
                                    ? 'border-[#C19D6C] bg-[#C19D6C]/10 shadow-md transform scale-[1.02]'
                                    : 'border-transparent bg-gray-50 hover:bg-white hover:shadow-sm hover:border-gray-200'}`}
                        >
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-colors
                            ${isSelected ? 'bg-[#C19D6C] text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    <Scissors size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className={`font-bold text-sm truncate pr-2 ${isSelected ? 'text-[#1A1A1A]' : 'text-gray-800'}`}>{service.name}</h4>
                                    <p className="text-xs text-gray-500">{service.duration_minutes} mins</p>
                                </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-black text-[#1A1A1A]">₹{service.price}</p>
                                {isSelected && <CheckCircle size={16} className="text-[#C19D6C] ml-auto mt-1" />}
                            </div>
                        </div>
                    );
                })}
            </div>

            {services.filter(s => s.category === activeCategory).length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    No services available in this category.
                </div>
            )}

        </div>
    );
};

export default ServiceSelection;
