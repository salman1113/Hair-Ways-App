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
                getQueue() // Get all bookings to calculate lifetime work
            ]);
            setEmployee(empData);
            setPayouts(payoutData);

            // Calculate lifetime work from all completed bookings assigned to this employee
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
            fetchAll(); // Refresh
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
                <div className="animate-spin w-8 h-8 border-4 border-[#3F0D12] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-20 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/admin/employees')} className="p-2 hover:bg-gray-100 rounded-xl transition">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-serif font-bold text-[#3F0D12]">
                            {employee?.user_details?.username || 'Employee'}
                        </h1>
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">
                            {employee?.job_title} • {commissionPct}% Commission
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">

                {/* 1️⃣ FINANCIAL OVERVIEW */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Lifetime Work */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Briefcase size={24} />
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Lifetime Work</p>
                        <h2 className="text-3xl font-black text-[#1A1A1A]">₹{lifetimeWork.toLocaleString()}</h2>
                    </div>

                    {/* Owner's Cut */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <IndianRupee size={24} />
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Owner's Cut ({100 - commissionPct}%)</p>
                        <h2 className="text-3xl font-black text-purple-700">₹{ownerCut.toLocaleString()}</h2>
                    </div>

                    {/* Pending Wallet (Employee's Cut) */}
                    <div className="bg-[#3F0D12] p-6 rounded-2xl shadow-xl text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><IndianRupee size={80} /></div>
                        <div className="relative z-10">
                            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Pending Payout</p>
                            <h2 className="text-3xl font-black text-[#C19D6C]">₹{parseFloat(pendingWallet).toLocaleString()}</h2>
                            <button
                                onClick={() => setShowSettleModal(true)}
                                disabled={pendingWallet <= 0}
                                className="mt-4 w-full bg-white text-[#3F0D12] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-100 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Settle Payment
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2️⃣ PAYOUT HISTORY */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-[#3F0D12]">Payout History</h3>
                    </div>

                    {payouts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-5">#</th>
                                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-5">Date</th>
                                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-5">Amount</th>
                                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-5">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((p, i) => (
                                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                            <td className="py-3 px-5 text-sm font-bold text-gray-500">{i + 1}</td>
                                            <td className="py-3 px-5 text-sm font-medium text-gray-700">
                                                {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-3 px-5 text-sm font-black text-green-700">₹{parseFloat(p.amount_paid).toLocaleString()}</td>
                                            <td className="py-3 px-5">
                                                {p.screenshot ? (
                                                    <a
                                                        href={`${MEDIA_BASE}${p.screenshot}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold"
                                                    >
                                                        <ExternalLink size={14} /> View
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <Clock size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="font-medium text-sm">No payouts recorded yet</p>
                        </div>
                    )}
                </section>
            </div>

            {/* 3️⃣ SETTLE PAYOUT MODAL */}
            {showSettleModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-3xl">
                            <h2 className="text-lg font-black text-[#3F0D12]">Settle Payment</h2>
                            <button onClick={() => { setShowSettleModal(false); setScreenshot(null); setPreviewUrl(null); }} className="text-gray-400 hover:text-black">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Amount Summary */}
                            <div className="bg-[#3F0D12] text-white p-4 rounded-2xl text-center">
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Paying Out</p>
                                <h2 className="text-3xl font-black text-[#C19D6C]">₹{parseFloat(pendingWallet).toLocaleString()}</h2>
                                <p className="text-white/50 text-[10px] mt-1">To {employee?.user_details?.username}</p>
                            </div>

                            {/* Screenshot Upload */}
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider block mb-2">
                                    Upload Payment Screenshot *
                                </label>
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#C19D6C] transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {previewUrl ? (
                                        <div className="space-y-2">
                                            <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                                            <p className="text-[10px] font-bold text-green-600 flex items-center justify-center gap-1">
                                                <CheckCircle size={12} /> {screenshot.name}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload size={32} className="mx-auto text-gray-300" />
                                            <p className="text-sm text-gray-400 font-medium">Click to upload screenshot</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSettlePayout}
                                disabled={!screenshot || isSubmitting}
                                className="w-full bg-[#3F0D12] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#2a090d] transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <>
                                        <CheckCircle size={18} /> Confirm Settlement
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
