import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee, updateEmployee, getEmployeeAttendance } from '../../services/api';
import api from '../../services/api';
import { UserPlus, Search, Trash2, Edit, Eye, X, Clock, CheckCircle, XCircle, Loader2, Star, Briefcase, User, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonTable } from '../../components/SkeletonRow';

const AdminEmployees = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Selected Employee & Expand State
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [selectedViewEmp, setSelectedViewEmp] = useState(null);

    // Expanded View State
    const [expandedEmpId, setExpandedEmpId] = useState(null);
    const [attendanceData, setAttendanceData] = useState({});
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    // Form Data
    const initialForm = {
        username: '', email: '', password: '', phone_number: '',
        job_title: '', commission_rate: '',
        shift_start: '', shift_end: '',
        years_of_experience: '', bio: '',
        rating: '', review_count: '',
        wallet_balance: '', is_available: true
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchEmployees(); }, []);

    // Filter Search
    useEffect(() => {
        if (!searchQuery) {
            setFilteredEmployees(employees);
        } else {
            const lowerQ = searchQuery.toLowerCase();
            setFilteredEmployees(employees.filter(emp =>
                emp.user_details.username.toLowerCase().includes(lowerQ) ||
                emp.user_details.email.toLowerCase().includes(lowerQ) ||
                emp.job_title.toLowerCase().includes(lowerQ)
            ));
        }
    }, [searchQuery, employees]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await getEmployees();
            setEmployees(data);
            setFilteredEmployees(data);
        } catch (error) {
            toast.error("Failed to load employees");
        }
        finally { setLoading(false); }
    };

    // Fetch View Attendance
    const loadViewAttendance = async (empId) => {
        if (!attendanceData[empId]) {
            setLoadingAttendance(true);
            try {
                const data = await getEmployeeAttendance(empId);
                setAttendanceData(prev => ({ ...prev, [empId]: data }));
            } catch (error) {
                toast.error("Failed to load attendance");
            } finally {
                setLoadingAttendance(false);
            }
        }
    };

    const handleEdit = (emp) => {
        setIsEditing(true);
        setSelectedEmp(emp);
        setFormData({
            username: emp.user_details.username,
            email: emp.user_details.email,
            phone_number: emp.user_details.phone_number,
            job_title: emp.job_title || '',
            commission_rate: emp.commission_rate || '',
            shift_start: emp.shift_start || '',
            shift_end: emp.shift_end || '',
            years_of_experience: emp.years_of_experience || '',
            bio: emp.bio || '',
            rating: emp.rating || '',
            review_count: emp.review_count || '',
            wallet_balance: emp.wallet_balance || '',
            is_available: emp.is_available,
            password: ''
        });
        setShowFormModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { ...formData };

        if (!payload.shift_start) delete payload.shift_start;
        if (!payload.shift_end) delete payload.shift_end;
        if (!payload.password) delete payload.password;

        if (!payload.wallet_balance) payload.wallet_balance = 0;
        if (!payload.rating) payload.rating = 5.0;
        if (!payload.review_count) payload.review_count = 0;
        if (!payload.years_of_experience) payload.years_of_experience = 0;
        if (!payload.commission_rate) payload.commission_rate = 0;

        const toastId = toast.loading(isEditing ? "Updating..." : "Creating...");

        try {
            if (isEditing) {
                await updateEmployee(selectedEmp.id, payload);
                toast.success("Updated Successfully!", { id: toastId });
            } else {
                await api.post('/accounts/employees/', payload);
                toast.success("Created Successfully!", { id: toastId });
            }
            setShowFormModal(false);
            fetchEmployees();
            setFormData(initialForm);
        } catch (error) {
            console.error(error);
            toast.error("Operation Failed. Check inputs.", { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This cannot be undone.")) {
            const toastId = toast.loading("Deleting...");
            try {
                await deleteEmployee(id);
                toast.success("Deleted", { id: toastId });
                fetchEmployees();
            } catch (error) {
                toast.error("Delete failed", { id: toastId });
            }
        }
    };

    return (
        <div className="relative min-h-screen pb-10">

            {/* ─── Header ─── */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight">Employees</h1>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Manage profiles & settings</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors"
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <button onClick={() => { setIsEditing(false); setFormData(initialForm); setShowFormModal(true); }}
                        className="bg-[#C19D6C] text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition hover:bg-[#a6865c] w-full sm:w-auto text-sm">
                        <UserPlus size={16} /> Add Staff
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-6">

                {/* ─── Employee Table ─── */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
                        <table className="w-full text-left text-sm min-w-[800px]"><tbody><SkeletonTable rows={5} cols={5} /></tbody></table>
                    </div>
                ) : filteredEmployees.length === 0 ? <p className="text-center text-gray-400 py-10 text-sm">No employees found.</p> : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
                        <div className="overflow-x-auto max-w-full pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                            <table className="w-full text-left text-sm min-w-[800px]">
                                <thead className="bg-gray-50 text-gray-400 font-semibold uppercase text-[10px] md:text-xs tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 md:p-5">Employee</th>
                                        <th className="p-4 md:p-5">Role & Shift</th>
                                        <th className="p-4 md:p-5">Stats</th>
                                        <th className="p-4 md:p-5">Status</th>
                                        <th className="p-4 md:p-5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredEmployees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-gray-50/80 transition">
                                            <td className="p-4 md:p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#1A1A1A] text-[#C19D6C] rounded-full flex items-center justify-center text-sm font-bold uppercase">
                                                        {emp.user_details?.username?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-black">{emp.user_details?.username}</p>
                                                        <p className="text-[11px] text-gray-400 tracking-wide">{emp.user_details?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 md:p-5">
                                                <p className="font-medium text-gray-700">{emp.job_title || 'Unassigned'}</p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-1 tracking-wider uppercase flex items-center gap-1">
                                                    <Clock size={10} /> {emp.shift_start?.slice(0, 5) || '--'} - {emp.shift_end?.slice(0, 5) || '--'}
                                                </p>
                                            </td>
                                            <td className="p-4 md:p-5">
                                                <div className="flex flex-col gap-1 text-[10px] font-medium uppercase tracking-wider">
                                                    <span className="flex items-center gap-1 text-gray-500"><Star size={10} className="text-amber-500" /> {emp.rating} ({emp.review_count})</span>
                                                    <span className="text-gray-400">{emp.years_of_experience} Yrs Exp</span>
                                                </div>
                                            </td>
                                            <td className="p-4 md:p-5">
                                                {emp.is_available ?
                                                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 tracking-wider uppercase border border-emerald-200"><CheckCircle size={10} /> Active</span> :
                                                    <span className="bg-red-50 text-red-400 px-3 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 tracking-wider uppercase border border-red-100"><XCircle size={10} /> Off</span>
                                                }
                                            </td>
                                            <td className="p-4 md:p-5 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button onClick={() => navigate(`/admin/employees/${emp.id}`)} className="p-2 border border-gray-200 text-emerald-600 bg-white rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition" title="Financial Details">
                                                        <IndianRupee size={15} />
                                                    </button>
                                                    <button onClick={() => { setSelectedViewEmp(emp); loadViewAttendance(emp.id); }} className="p-2 border border-gray-200 text-blue-600 bg-white rounded-lg hover:bg-blue-50 hover:text-blue-700 transition" title="View Details">
                                                        <Eye size={15} />
                                                    </button>
                                                    <button onClick={() => handleEdit(emp)} className="p-2 border border-gray-200 text-amber-600 bg-white rounded-lg hover:bg-amber-50 hover:text-amber-700 transition" title="Edit Employee">
                                                        <Edit size={15} />
                                                    </button>
                                                    <button onClick={() => handleDelete(emp.id)} className="p-2 border border-gray-200 text-red-400 bg-white rounded-lg hover:bg-red-50 hover:text-red-600 transition" title="Delete Employee">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── Add/Edit Modal ─── */}
                {showFormModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[100] p-0 md:p-4 backdrop-blur-sm">
                        <div className="bg-white mx-auto rounded-t-2xl md:rounded-2xl w-full max-w-2xl relative animate-fade-in-up flex flex-col max-h-[90vh] shadow-2xl">
                            <div className="p-5 md:p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
                                <h2 className="text-lg font-bold text-black">{isEditing ? 'Edit Profile' : 'New Employee'}</h2>
                                <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-black transition"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto w-full space-y-5">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Username *" className="p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                    <input type="text" placeholder="Phone *" className="p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors" required value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <input type="email" placeholder="Email *" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    {!isEditing && <input type="password" placeholder="Password *" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <input type="text" placeholder="Job Title" className="p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors" value={formData.job_title} onChange={e => setFormData({ ...formData, job_title: e.target.value })} />
                                    <input type="number" placeholder="Experience" className="p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors" value={formData.years_of_experience} onChange={e => setFormData({ ...formData, years_of_experience: e.target.value })} />
                                    <input type="number" placeholder="Commission %" className="p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors" value={formData.commission_rate} onChange={e => setFormData({ ...formData, commission_rate: e.target.value })} />
                                </div>

                                <textarea placeholder="Bio (Optional)" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors" rows="2" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}></textarea>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs font-medium text-gray-400 mb-3 uppercase flex items-center gap-2"><Briefcase size={13} /> Optional Details</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div><label className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Wallet</label><input type="number" className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black" value={formData.wallet_balance} onChange={e => setFormData({ ...formData, wallet_balance: e.target.value })} /></div>
                                        <div><label className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Rating</label><input type="number" step="0.1" className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} /></div>
                                        <div><label className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Reviews</label><input type="number" className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black" value={formData.review_count} onChange={e => setFormData({ ...formData, review_count: e.target.value })} /></div>
                                        <div className="flex items-center gap-2 pt-4">
                                            <input type="checkbox" className="w-5 h-5 accent-black" checked={formData.is_available} onChange={e => setFormData({ ...formData, is_available: e.target.checked })} />
                                            <label className="text-sm font-medium">Active</label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Shift Start</label><input type="time" className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black" value={formData.shift_start} onChange={e => setFormData({ ...formData, shift_start: e.target.value })} /></div>
                                        <div><label className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Shift End</label><input type="time" className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black" value={formData.shift_end} onChange={e => setFormData({ ...formData, shift_end: e.target.value })} /></div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-3.5 bg-[#C19D6C] text-white rounded-lg font-medium hover:bg-[#a6865c] transition text-sm">
                                    {isEditing ? 'Save Changes' : 'Create Account'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── View Employee Details Modal ─── */}
                {selectedViewEmp && (
                    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[100] p-0 md:p-4 backdrop-blur-sm">
                        <div className="bg-white mx-auto rounded-t-2xl md:rounded-2xl w-full max-w-2xl relative animate-fade-in-up flex flex-col max-h-[90vh] shadow-2xl">
                            {/* Header */}
                            <div className="bg-black p-5 md:p-6 text-white flex justify-between items-start rounded-t-2xl shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center text-xl font-bold uppercase">
                                        {selectedViewEmp.user_details?.username?.[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedViewEmp.user_details?.username}</h2>
                                        <p className="text-[10px] text-white/50 uppercase tracking-widest font-medium">{selectedViewEmp.job_title || 'Employee'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedViewEmp(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                                    <X size={18} className="text-white" />
                                </button>
                            </div>

                            <div className="p-4 md:p-6 overflow-y-auto w-full space-y-6">
                                {/* Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                                        <Briefcase size={18} className="text-gray-400 mb-2" />
                                        <span className="text-lg font-bold text-black">{selectedViewEmp.years_of_experience}</span>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Years Exp</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                                        <Star size={18} className="text-gray-400 mb-2" />
                                        <span className="text-lg font-bold text-black">{selectedViewEmp.rating}</span>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Rating</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                                        <IndianRupee size={18} className="text-gray-400 mb-2" />
                                        <span className="text-lg font-bold text-black">{selectedViewEmp.commission_rate}%</span>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Commission</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                                        <IndianRupee size={18} className="text-gray-400 mb-2" />
                                        <span className="text-lg font-bold text-black">₹{selectedViewEmp.wallet_balance}</span>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Wallet</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                    <h3 className="font-semibold text-black mb-3 border-b border-gray-200 pb-2 flex items-center gap-2 text-sm"><User size={15} /> Contact & Info</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                        <div><span className="text-gray-400 block text-[10px] font-medium tracking-wider uppercase mb-1">Email</span> <span className="font-medium text-black">{selectedViewEmp.user_details?.email}</span></div>
                                        <div><span className="text-gray-400 block text-[10px] font-medium tracking-wider uppercase mb-1">Phone</span> <span className="font-medium text-black">{selectedViewEmp.user_details?.phone_number || 'N/A'}</span></div>
                                        <div><span className="text-gray-400 block text-[10px] font-medium tracking-wider uppercase mb-1">Shift Timings</span> <span className="font-medium text-black">{selectedViewEmp.shift_start?.slice(0, 5) || 'N/A'} - {selectedViewEmp.shift_end?.slice(0, 5) || 'N/A'}</span></div>
                                        <div><span className="text-gray-400 block text-[10px] font-medium tracking-wider uppercase mb-1">Status</span> {selectedViewEmp.is_available ? <span className="text-black font-semibold">Available</span> : <span className="text-gray-400 font-medium">Unavailable</span>}</div>
                                    </div>
                                    {selectedViewEmp.bio && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <span className="text-gray-400 block text-[10px] mb-1 font-medium uppercase tracking-wider">Bio</span>
                                            <p className="text-sm text-gray-600 leading-relaxed">{selectedViewEmp.bio}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Attendance */}
                                <div>
                                    <h3 className="font-semibold text-black mb-3 flex items-center gap-2 text-sm"><Clock size={15} /> Recent Attendance</h3>
                                    {loadingAttendance && !attendanceData[selectedViewEmp.id] ? (
                                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400" size={22} /></div>
                                    ) : attendanceData[selectedViewEmp.id]?.length === 0 ? (
                                        <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-400 text-sm border border-gray-100 font-medium">No attendance logs found for this employee.</div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                            <div className="max-h-60 overflow-y-auto w-full scrollbar-thin">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-gray-100 text-gray-400 text-[10px] uppercase tracking-wider font-medium sticky top-0 border-b border-gray-200">
                                                        <tr>
                                                            <th className="p-3">Date</th>
                                                            <th className="p-3">Check In</th>
                                                            <th className="p-3">Check Out</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {attendanceData[selectedViewEmp.id]?.map(att => (
                                                            <tr key={att.id} className="hover:bg-white transition">
                                                                <td className="p-3 font-medium text-gray-700 text-xs">{att.date}</td>
                                                                <td className="p-3 text-gray-600 font-medium text-xs">{att.check_in ? att.check_in.slice(0, 5) : '--'}</td>
                                                                <td className="p-3 text-gray-600 font-medium text-xs">{att.check_out ? att.check_out.slice(0, 5) : '--'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminEmployees;
