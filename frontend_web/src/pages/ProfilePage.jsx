import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking, getUserProfile, updateUserProfile } from '../services/api';
import { generateTicketPDF } from '../utils/ticketGenerator';
import { Loader2, Calendar, Clock, User, Scissors, LogOut, Ticket, XCircle, Edit, Crown, Star, Sparkles, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/profile/StatsCard';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileData, bookingsData] = await Promise.all([
                getUserProfile(),
                getMyBookings()
            ]);
            setProfile(profileData);
            setBookings(bookingsData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile data");
        }
        finally { setLoading(false); }
    };

    const handleUpdateProfile = async (updatedData) => {
        const newProfile = await updateUserProfile(updatedData);
        setProfile(newProfile);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try { await cancelBooking(id); fetchData(); toast.success("Booking Cancelled"); }
        catch { toast.error("Cancellation Failed"); }
    };

    const handleDownloadTicket = (booking) => {
        generateTicketPDF(booking);
    };

    const upcomingBookings = bookings.filter(b => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status));
    const historyBookings = bookings.filter(b => b.status === 'COMPLETED');
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

    const getDisplayData = () => {
        if (activeTab === 'upcoming') return upcomingBookings;
        if (activeTab === 'history') return historyBookings;
        return cancelledBookings;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]"><Loader2 className="animate-spin text-[#C19D6C]" size={40} /></div>;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-[#0B0B0c] text-white">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#1A1A1A] pb-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-[#1A1A1A] border-2 border-[#C19D6C] flex items-center justify-center text-4xl font-bold text-[#C19D6C]">
                                {profile?.username?.[0] || "U"}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#C19D6C] text-black p-1.5 rounded-full border-4 border-[#0B0B0B]">
                                <Crown size={16} fill="currentColor" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight mb-1">{profile?.username}</h1>
                            <p className="text-gray-400 text-sm tracking-wide">{profile?.email}</p>
                            <div className="flex gap-2 mt-3">
                                <span className="bg-[#1A1A1A] text-[#C19D6C] text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-[#C19D6C]/20">
                                    {profile?.role}
                                </span>
                                {profile?.tier && (
                                    <span className="bg-[#1A1A1A] text-gray-300 text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-gray-700">
                                        {profile.tier} Member
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="px-6 py-2.5 bg-[#1A1A1A] text-white border border-[#333] hover:border-[#C19D6C] rounded-full font-bold text-sm transition flex items-center gap-2"
                        >
                            <Edit size={16} /> Edit Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-full font-bold text-sm transition flex items-center gap-2"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                {/* --- STATS ROW --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Loyalty Points" value={profile?.points || 0} icon={Star} color="bg-yellow-500" />
                    <StatsCard title="Total Bookings" value={historyBookings.length} icon={Calendar} subtext="Lifetime visits" />
                    <StatsCard title="Face Shape" value={profile?.face_shape || 'N/A'} icon={User} subtext="Your style guide" />
                    <StatsCard title="Member Since" value={new Date(profile?.date_joined).getFullYear()} icon={Clock} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- LEFT COLUMN --- */}
                    <div className="space-y-6">
                        {/* Bio Card */}
                        <div className="bg-[#1A1A1A] rounded-3xl p-6 border border-[#333]">
                            <h3 className="text-[#C19D6C] font-bold text-lg mb-4 flex items-center gap-2">
                                <User size={18} /> Personal Bio
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed italic">
                                "{profile?.bio || "No bio added yet. Add a bio to let your barber know more about you."}"
                            </p>
                            <div className="mt-6 pt-6 border-t border-[#333]">
                                <h4 className="text-white font-bold text-sm mb-2">Styling Preferences</h4>
                                <p className="text-gray-500 text-sm">
                                    {profile?.preferences || "No preferences set yet."}
                                </p>
                            </div>
                        </div>

                        {/* Style Tip Card */}
                        {profile?.face_shape && (
                            <div className="bg-[#C19D6C]/10 rounded-3xl p-6 border border-[#C19D6C]/20">
                                <h3 className="text-[#C19D6C] font-bold text-lg mb-2 flex items-center gap-2">
                                    <Sparkles size={18} /> Style Tip
                                </h3>
                                <p className="text-[#C19D6C]/80 text-sm leading-relaxed">
                                    For a <b>{profile.face_shape}</b> face, consider styles that {
                                        profile.face_shape === 'Oval' ? 'maintain balance, like a pompadour or quiff.' :
                                            profile.face_shape === 'Round' ? 'add height and structure, like a high fade.' :
                                                profile.face_shape === 'Square' ? 'soften the jawline, like a layered cut.' : 'compliment your features.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN (BOOKINGS) --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-[#333] pb-1">
                            {['upcoming', 'history', 'cancelled'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all relative
                                    ${activeTab === tab ? 'text-[#C19D6C]' : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    {tab}
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C19D6C]"></div>}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            {getDisplayData().length === 0 ? (
                                <div className="text-center py-20 bg-[#1A1A1A] rounded-3xl border border-[#333] border-dashed">
                                    <div className="w-16 h-16 bg-[#0B0B0B] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333]">
                                        <Calendar className="text-gray-600" size={24} />
                                    </div>
                                    <h3 className="text-gray-300 font-bold mb-1">No bookings found</h3>
                                    <p className="text-gray-600 text-sm mb-6">You don't have any bookings in this list.</p>
                                    {activeTab === 'upcoming' && (
                                        <button onClick={() => navigate('/book')} className="px-6 py-2 bg-[#C19D6C] text-black rounded-full font-bold text-sm hover:bg-white transition">
                                            Book Appointment
                                        </button>
                                    )}
                                </div>
                            ) : (
                                getDisplayData().map((booking) => (
                                    <div key={booking.id} className="bg-[#1A1A1A] p-6 rounded-3xl border border-[#333] hover:border-[#C19D6C]/50 transition group">
                                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">

                                            <div className="flex items-start gap-5">
                                                <div className="bg-[#0B0B0B] w-20 h-20 rounded-2xl flex flex-col items-center justify-center border border-[#333] group-hover:border-[#C19D6C] transition">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">{new Date(booking.booking_date).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-3xl font-bold text-white">{new Date(booking.booking_date).getDate()}</span>
                                                </div>

                                                <div>
                                                    <h4 className="text-white font-bold text-lg flex items-center gap-3">
                                                        Token #{booking.token_number}
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                                booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                    booking.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </h4>
                                                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-4">
                                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#C19D6C]" /> {booking.booking_time}</span>
                                                        <span className="flex items-center gap-1.5"><User size={14} className="text-[#C19D6C]" /> {booking.employee_details?.user_details?.username || "Stylist"}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {booking.status !== 'CANCELLED' && (
                                                    <button onClick={() => handleDownloadTicket(booking)} className="p-3 bg-[#0B0B0B] text-gray-400 rounded-xl hover:text-white hover:bg-[#333] transition" title="Download Ticket">
                                                        <Ticket size={18} />
                                                    </button>
                                                )}
                                                {activeTab === 'upcoming' && booking.status === 'PENDING' && (
                                                    <button onClick={() => handleCancel(booking.id)} className="px-4 py-2 border border-red-900/50 text-red-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-900/20 transition">
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>

                                        </div>

                                        {/* Services */}
                                        <div className="mt-5 pt-5 border-t border-[#2A2A2A] flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex flex-wrap gap-2">
                                                {booking.items.map((item, i) => (
                                                    <span key={i} className="text-[10px] bg-[#0B0B0B] text-gray-400 px-3 py-1 rounded-lg border border-[#333]">
                                                        {item.service_name}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-[#C19D6C] font-bold text-lg">₹{booking.total_price}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* EDIT MODAL */}
            {showEditModal && (
                <ProfileEditModal
                    user={profile}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleUpdateProfile}
                />
            )}
        </div>
    );
};

export default ProfilePage;