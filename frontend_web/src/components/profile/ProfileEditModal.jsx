import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileEditModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        username: user.username,
        phone_number: user.phone_number || '',
        bio: user.bio || '',
        preferences: user.preferences || '',
        face_shape: user.face_shape || '',
        birth_date: user.birth_date || ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData };
        if (!payload.birth_date) payload.birth_date = null;
        if (!payload.phone_number) payload.phone_number = null;
        if (!payload.face_shape) payload.face_shape = "";

        const toastId = toast.loading("Updating Profile...");

        try {
            await onSave(payload);
            toast.success("Profile Updated Successfully! 🎉", { id: toastId });
            onClose();
        } catch (error) {
            console.error(error);
            let errorMsg = "Update failed. Please try again.";
            if (error.response && error.response.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    errorMsg = Object.entries(data)
                        .map(([key, val]) => `${key.replace('_', ' ')}: ${Array.isArray(val) ? val.join(', ') : val}`)
                        .join('\n');
                } else {
                    errorMsg = String(data);
                }
            }
            toast.error(errorMsg, { id: toastId, duration: 5000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] rounded-3xl w-full max-w-lg overflow-hidden border border-[#333] shadow-2xl animate-fade-in-up">

                {/* Header */}
                <div className="bg-[#0B0B0B] p-5 flex justify-between items-center border-b border-[#333]">
                    <h2 className="text-white font-sans text-xl font-bold tracking-wide">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-[#C19D6C] transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-[#C19D6C] uppercase tracking-widest mb-2 block">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#0B0B0B] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#C19D6C] transition"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[#C19D6C] uppercase tracking-widest mb-2 block">Phone</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#0B0B0B] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#C19D6C] transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-[#C19D6C] uppercase tracking-widest mb-2 block">Bio / Status</label>
                        <textarea
                            name="bio"
                            rows="2"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us a bit about yourself..."
                            className="w-full p-3 bg-[#0B0B0B] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#C19D6C] transition resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-[#C19D6C] uppercase tracking-widest mb-2 block">Styling Preferences</label>
                        <textarea
                            name="preferences"
                            rows="2"
                            value={formData.preferences}
                            onChange={handleChange}
                            placeholder="e.g. I prefer short sides, natural look..."
                            className="w-full p-3 bg-[#0B0B0B] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#C19D6C] transition resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-[#C19D6C] uppercase tracking-widest mb-2 block">Face Shape</label>
                            <select
                                name="face_shape"
                                value={formData.face_shape}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#0B0B0B] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#C19D6C] transition appearance-none"
                            >
                                <option value="">Select...</option>
                                <option value="Oval">Oval</option>
                                <option value="Round">Round</option>
                                <option value="Square">Square</option>
                                <option value="Diamond">Diamond</option>
                                <option value="Heart">Heart</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[#C19D6C] uppercase tracking-widest mb-2 block">Birth Date</label>
                            <input
                                type="date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#0B0B0B] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#C19D6C] transition [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#C19D6C] text-black font-bold rounded-xl hover:bg-white transition shadow-lg flex items-center justify-center gap-2 mt-4 uppercase tracking-widest text-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ProfileEditModal;
