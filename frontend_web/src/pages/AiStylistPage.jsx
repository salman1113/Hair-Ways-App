import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { analyzeFaceShape } from '../services/api';

const AiStylistPage = () => {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file.');
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError('');
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResult(null);
        setError('');
    };

    const handleAnalysis = async () => {
        if (!selectedImage) return;
        setAnalyzing(true);
        setError('');
        try {
            const response = await analyzeFaceShape(selectedImage);
            if (response && response.data) {
                setResult(response.data);
            } else {
                setError('Unexpected AI response format.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to analyze the photo. Please try another image showing your face clearly.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-28 md:pt-32 pb-16 md:pb-24 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Header */}
                <div className="text-center mb-10 md:mb-16">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[#C19D6C]/10 border border-[#C19D6C]/20 mb-4 md:mb-6">
                        <Sparkles size={14} className="text-[#C19D6C]" />
                        <span className="text-[10px] md:text-xs font-bold text-[#C19D6C] uppercase tracking-widest">Powered by Computer Vision AI</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 md:mb-6">
                        Virtual <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C19D6C] to-[#a38355]">Stylist</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto">
                        Upload a selfie, and our AI will mathematically calculate your facial proportions to determine your true face shape and recommend the perfect haircut.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">

                    {/* Left Column: Upload Area */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
                        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#C19D6C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {!previewUrl ? (
                                <div className="border-2 border-dashed border-[#C19D6C]/30 rounded-2xl p-12 text-center relative hover:border-[#C19D6C]/60 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-20 h-20 bg-[#C19D6C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Upload size={32} className="text-[#C19D6C]" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Upload a Selfie</h3>
                                    <p className="text-gray-400">Drag & drop or click to browse</p>
                                    <p className="text-xs text-gray-500 mt-4">For best results, face forward and pull hair back.</p>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] md:aspect-square group/img">
                                    <img src={previewUrl} alt="Selfie Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button onClick={clearImage} className="px-4 py-2 text-sm md:text-base md:px-6 bg-white/10 text-white rounded-full font-bold backdrop-blur-md hover:bg-white/20 transition">
                                            Change Photo
                                        </button>
                                        {!analyzing && !result && (
                                            <button onClick={handleAnalysis} className="px-4 py-2 text-sm md:text-base md:px-6 bg-[#C19D6C] text-black rounded-full font-bold hover:shadow-[0_0_20px_rgba(193,157,108,0.4)] transition">
                                                Analyze Now
                                            </button>
                                        )}
                                    </div>

                                    {/* Analysis Scanning Overlay */}
                                    <AnimatePresence>
                                        {analyzing && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                                            >
                                                <div className="w-24 h-24 mb-6 relative">
                                                    <div className="absolute inset-0 border-t-4 border-[#C19D6C] rounded-full animate-spin"></div>
                                                    <div className="absolute inset-4 border-r-4 border-white/20 rounded-full animate-[spin_2s_linear_reverse]"></div>
                                                    <Sparkles className="absolute inset-0 m-auto text-[#C19D6C]" size={28} />
                                                </div>
                                                <h4 className="text-xl font-bold text-white mb-2">Scanning Facial Landmarks...</h4>
                                                <p className="text-[#C19D6C] text-sm animate-pulse">Calculating Proportions</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                <p className="text-red-400 text-sm">{error}</p>
                            </motion.div>
                        )}

                        {/* Quick Actions if image is loaded but not analyzed */}
                        {previewUrl && !analyzing && !result && (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                onClick={handleAnalysis}
                                className="w-full py-4 bg-gradient-to-r from-[#C19D6C] to-[#a38355] text-black rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(193,157,108,0.3)] hover:shadow-[0_4px_30px_rgba(193,157,108,0.5)] transition-all hover:-translate-y-1"
                            >
                                Launch AI Analysis
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Right Column: Results Area */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {!result && !analyzing ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center p-8 md:p-12 border border-white/5 rounded-3xl bg-[#111]/50 py-16 md:py-32">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 md:mb-6">
                                        <Sparkles className="text-gray-500 w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-400 mb-2">Awaiting Image</h3>
                                    <p className="text-gray-600 text-xs md:text-sm">Upload a photo to see your AI-generated results and haircut recommendations.</p>
                                </motion.div>
                            ) : result ? (
                                <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">

                                    {/* Shape Card */}
                                    <div className="bg-[#111] border border-[#C19D6C]/30 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                                        <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
                                            <CheckCircle2 className="text-[#C19D6C] w-5 h-5 md:w-6 md:h-6" />
                                            <h2 className="text-xl md:text-2xl font-bold">Analysis Complete</h2>
                                        </div>

                                        <div className="mb-6 md:mb-8 relative z-10">
                                            <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider mb-2">Detected Face Shape</p>
                                            <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#C19D6C] to-[#fff]">{result.face_shape}</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-2 relative z-10">
                                            <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10">
                                                <p className="text-[10px] md:text-xs text-gray-500 mb-1">Width/Length Ratio</p>
                                                <p className="text-lg md:text-xl font-bold font-mono">{result.metrics.face_width_to_length_ratio}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10">
                                                <p className="text-[10px] md:text-xs text-gray-500 mb-1">Jaw/Width Ratio</p>
                                                <p className="text-lg md:text-xl font-bold font-mono">{result.metrics.jaw_to_face_width_ratio}</p>
                                            </div>
                                        </div>

                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C19D6C] opacity-5 rounded-full blur-3xl -mr-10 -mt-20"></div>
                                    </div>

                                    {/* Recommended Styles — Premium Cards */}
                                    <div>
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <Sparkles size={20} className="text-[#C19D6C]" />
                                            Recommended Styles
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.recommended_hairstyles.map((style, idx) => {
                                                const name = typeof style === 'string' ? style : style.name;
                                                let imageUrl = typeof style === 'object' ? style.image_url : null;

                                                // ലളിതമായ URL logic
                                                if (imageUrl && imageUrl.startsWith('/')) {
                                                    const base = "https://api.hairways.in";
                                                    // ലോക്കൽ ഹോസ്റ്റിലാണ് ടെസ്റ്റ് ചെയ്യുന്നതെങ്കിൽ മാത്രം മാറ്റുക
                                                    const isLocal = window.location.hostname === 'localhost';
                                                    imageUrl = isLocal ? `http://localhost:8001${imageUrl}` : `${base}${imageUrl}`;
                                                }
                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4 + (idx * 0.12) }}
                                                        key={idx}
                                                        className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden group hover:border-[#C19D6C]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(193,157,108,0.1)] flex flex-col"
                                                    >
                                                        {/* Style Image */}
                                                        <div className="aspect-[4/3] w-full bg-[#1a1a1a] relative overflow-hidden">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            {/* Fallback placeholder if no image or image fails */}
                                                            <div
                                                                className={`absolute inset-0 bg-gradient-to-br from-[#C19D6C]/10 to-[#1a1a1a] items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
                                                            >
                                                                <Sparkles size={40} className="text-[#C19D6C]/30" />
                                                            </div>
                                                            {/* Subtle gradient overlay on hover */}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                        </div>

                                                        {/* Card Body */}
                                                        <div className="p-4 md:p-5 flex flex-col flex-1">
                                                            <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C19D6C] to-[#e0c9a0] mb-3">
                                                                {name}
                                                            </h4>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiStylistPage;
