import React from 'react';
import { Scissors, Instagram, Facebook, Twitter, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#f8f5f2] py-20 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

                <div className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-[#C19D6C] rounded-full text-white"><Scissors size={20} /></div>
                        <h2 className="text-2xl font-bold text-black tracking-tight">Hair Ways.</h2>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A]">
                        Stay sharp, stay confident – <br /> classic cuts & modern grooming.
                    </h3>
                    <div className="flex gap-4 mb-8">
                        <div className="p-3 bg-white rounded-full border border-gray-200 hover:bg-[#C19D6C] hover:border-[#C19D6C] hover:text-white transition cursor-pointer"><Facebook size={18} /></div>
                        <div className="p-3 bg-white rounded-full border border-gray-200 hover:bg-[#C19D6C] hover:border-[#C19D6C] hover:text-white transition cursor-pointer"><Twitter size={18} /></div>
                        <div className="p-3 bg-white rounded-full border border-gray-200 hover:bg-[#C19D6C] hover:border-[#C19D6C] hover:text-white transition cursor-pointer"><Instagram size={18} /></div>
                    </div>
                </div>

                <div className="space-y-4 text-sm text-gray-500">
                    <p className="font-bold text-black mb-2">Contact Us</p>
                    <p className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</p>
                    <p className="flex items-center gap-2"><Mail size={14} /> hello@hairways.com</p>
                    <p className="flex items-center gap-2 max-w-xs"><MapPin size={14} className="flex-shrink-0" /> Perambra, Calicut, Kerala</p>
                </div>

            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                <p>© 2026 Hair Ways. All Rights Reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-black">Privacy Policy</a>
                    <a href="#" className="hover:text-black">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
