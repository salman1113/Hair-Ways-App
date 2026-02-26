import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, IndianRupee, Briefcase, Image, Upload, X, CheckCircle, Clock, User, ExternalLink
} from 'lucide-react';
import { getEmployeeDetail, getPayoutHistory, settlePayout, getQueue } from '../../services/api';
import toast from 'react-hot-toast';

const AdminEmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Settle Modal
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [screenshot, setScreenshot] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lifetime Stats
    const [lifetimeWork, setLifetimeWork] = useState(0);

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [empData, payoutData, queueData] = await Promise.all([
                getEmployeeDetail(id),
                getPayoutHistory(id),
                getQueue()
            ]);
            setEmployee(empData);
            setPayouts(payoutData);

            const allBookings = Array.isArray(queueData) ? queueData : [];
            const empBookings = allBookings.filter(b => b.employee === parseInt(id) && b.status === 'COMPLETED');
            const total = empBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
            setLifetimeWork(total);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load employee data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setScreenshot(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSettlePayout = async () => {
        if (!screenshot) return toast.error("Please attach a screenshot");
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('amount_paid', employee?.pending_wallet_balance || 0);
        formData.append('screenshot', screenshot);

        try {
            await settlePayout(id, formData);
            toast.success("Payout settled successfully!");
            setShowSettleModal(false);
            setScreenshot(null);
            setPreviewUrl(null);
            fetchAll();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to settle payout");
        } finally {
            setIsSubmitting(false);
        }
    };

    const commissionPct = employee?.commission_percentage || 50;
    const pendingWallet = employee?.pending_wallet_balance || 0;
    const ownerCut = lifetimeWork * ((100 - commissionPct) / 100);
    const employeeCut = lifetimeWork * (commissionPct / 100);

    const MEDIA_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('/api/v1', '');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/80 pb-12">

            {/* ─── Header — NO sticky ─── */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-5">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/admin/employees')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft size={18} className="text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight">
                            {employee?.user_details?.username || 'Employee'}
                        </h1>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                            {employee?.job_title} • {commissionPct}% Commission
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">

                {/* ─── Financial Overview ─── */}
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Total Lifetime Work */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Briefcase size={20} />
                        </div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total Lifetime Work</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-black">₹{lifetimeWork.toLocaleString()}</h2>
                    </div>

                    {/* Owner's Cut */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="w-11 h-11 bg-[#C19D6C]/10 text-[#C19D6C] rounded-lg flex items-center justify-center mx-auto mb-3">
                            <IndianRupee size={20} />
                        </div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Owner's Cut ({100 - commissionPct}%)</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-black">₹{ownerCut.toLocaleString()}</h2>
                    </div>

                    {/* Pending Wallet */}
                    <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-sm text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5"><IndianRupee size={80} /></div>
                        <div className="relative z-10">
                            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Pending Payout</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#C19D6C]">₹{parseFloat(pendingWallet).toLocaleString()}</h2>
                            <button
                                onClick={() => setShowSettleModal(true)}
                                disabled={pendingWallet <= 0}
                                className="mt-4 w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-gray-100 transition active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Settle Payment
                            </button>
                        </div>
                    </div>
                </section>

                {/* ─── Payout History ─── */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-sm text-black">Payout History</h3>
                    </div>

                    {payouts.length > 0 ? (
                        <div className="overflow-x-auto scrollbar-thin">
                            <table className="w-full min-w-[500px]">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider py-3 px-5">#</th>
                                        <th className="text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider py-3 px-5">Date</th>
                                        <th className="text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider py-3 px-5">Amount</th>
                                        <th className="text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider py-3 px-5">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((p, i) => (
                                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition">
                                            <td className="py-3 px-5 text-sm font-medium text-gray-400">{i + 1}</td>
                                            <td className="py-3 px-5 text-sm font-medium text-gray-700">
                                                {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-3 px-5 text-sm font-bold text-emerald-700">₹{parseFloat(p.amount_paid).toLocaleString()}</td>
                                            <td className="py-3 px-5">
                                                {p.screenshot ? (
                                                    <a
                                                        href={`${MEDIA_BASE}${p.screenshot}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                                                    >
                                                        <ExternalLink size={13} /> View
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-300">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-300">
                            <Clock size={36} className="mx-auto mb-3" />
                            <p className="font-medium text-sm text-gray-400">No payouts recorded yet</p>
                        </div>
                    )}
                </section>
            </div>

            {/* ─── Settle Payout Modal ─── */}
            {showSettleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-black">Settle Payment</h2>
                            <button onClick={() => { setShowSettleModal(false); setScreenshot(null); setPreviewUrl(null); }} className="text-gray-400 hover:text-black transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Amount Summary */}
                            <div className="bg-[#1A1A1A] text-white p-5 rounded-xl text-center">
                                <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Paying Out</p>
                                <h2 className="text-3xl font-bold text-[#C19D6C]">₹{parseFloat(pendingWallet).toLocaleString()}</h2>
                                <p className="text-white/40 text-[10px] mt-1.5">To {employee?.user_details?.username}</p>
                            </div>

                            {/* Screenshot Upload */}
                            <div>
                                <label className="text-[10px] font-medium uppercase text-gray-400 tracking-wider block mb-2">
                                    Upload Payment Screenshot *
                                </label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-400 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {previewUrl ? (
                                        <div className="space-y-2">
                                            <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                                            <p className="text-[10px] font-medium text-gray-600 flex items-center justify-center gap-1">
                                                <CheckCircle size={12} /> {screenshot.name}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload size={28} className="mx-auto text-gray-300" />
                                            <p className="text-sm text-gray-400 font-medium">Click to upload screenshot</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSettlePayout}
                                disabled={!screenshot || isSubmitting}
                                className="w-full bg-[#C19D6C] text-white font-medium py-3.5 rounded-lg text-sm hover:bg-[#a6865c] transition active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <>
                                        <CheckCircle size={16} /> Confirm Settlement
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEmployeeDetail;
