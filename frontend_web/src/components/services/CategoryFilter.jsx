import React from 'react';

const CategoryFilter = ({ categories, activeCategory, setActiveCategory }) => {
    return (
        <div className="sticky top-20 z-10 bg-white/80 backdrop-blur-md py-4 border-b border-gray-100 mb-8">
            <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide flex gap-3">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0
            ${!activeCategory ? 'bg-[#3F0D12] text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    All Services
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0
            ${activeCategory === cat.id ? 'bg-[#3F0D12] text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;
