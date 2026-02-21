import React from 'react';
import { Clock, IndianRupee, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
    const navigate = useNavigate();

    const handleBook = () => {
        // Navigate to booking, potentially pre-selecting this service (future enhancement)
        // For now, simple redirect
        navigate('/book');
    };

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">

            {/* Image Placeholder (Using generic colors for now, or actual images if available) */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {/* Placeholder Icon/Text if no image */}
                <div className="absolute bottom-4 left-4 text-white">
                    <span className="bg-[#D72638] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide mb-1 inline-block">
                        {service.category_details?.name || 'Treatment'}
                    </span>
                    <h3 className="font-bold text-lg leading-tight">{service.name}</h3>
                </div>
            </div>

            <div className="p-5">

                {/* Description */}
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {service.description || "Experience our premium service designed to make you look and feel your best."}
                </p>

                {/* Details */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm font-medium">
                        <Clock size={16} className="text-[#D72638]" />
                        {service.duration_minutes} mins
                    </div>
                    <div className="flex items-center gap-0.5 text-[#3F0D12] font-black text-lg">
                        <IndianRupee size={16} strokeWidth={3} />
                        {service.price}
                    </div>
                </div>

                {/* Action */}
                <button
                    onClick={handleBook}
                    className="w-full py-3 rounded-xl bg-gray-50 text-[#3F0D12] font-bold flex items-center justify-center gap-2 group-hover:bg-[#3F0D12] group-hover:text-white transition-colors"
                >
                    Book Now <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>

            </div>
        </div>
    );
};

export default ServiceCard;
