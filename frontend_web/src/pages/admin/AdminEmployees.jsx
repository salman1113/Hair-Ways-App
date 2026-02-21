import React, { useState, useEffect } from 'react';
import { getEmployees, deleteEmployee, updateEmployee, getEmployeeAttendance } from '../../services/api';
import api from '../../services/api'; 
import { UserPlus, Search, Trash2, Edit, Eye, X, Clock, CheckCircle, XCircle, Loader2, DollarSign, Star, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Selected Employee & Expand State
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  // 🔥 EXPANDED CARD STATE
  const [expandedEmpId, setExpandedEmpId] = useState(null);
  const [attendanceData, setAttendanceData] = useState({}); // Cache Attendance Data
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

  // 🔥 TOGGLE ATTENDANCE DROPDOWN
  const toggleAttendance = async (empId) => {
      if (expandedEmpId === empId) {
          setExpandedEmpId(null); // Close if already open
          return;
      }

      setExpandedEmpId(empId);
      
      // If data not already fetched, fetch it
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
      if(window.confirm("Are you sure? This cannot be undone.")) {
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
      <Toaster position="top-center"/>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#3F0D12]">Staff Directory</h1>
            <p className="text-gray-500">Manage profiles & settings</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
             </div>
             <button onClick={() => { setIsEditing(false); setFormData(initialForm); setShowFormModal(true); }}
                className="bg-[#3F0D12] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition hover:bg-[#5a1a20]">
                <UserPlus size={18}/> Add
             </button>
          </div>
      </div>

      {/* List */}
      {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#3F0D12]" size={32}/></div> : 
       filteredEmployees.length === 0 ? <p className="text-center text-gray-400 py-10">No employees found.</p> : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col h-full">
                
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#3F0D12] text-white rounded-full flex items-center justify-center text-xl font-bold uppercase shadow-sm">
                            {emp.user_details?.username?.[0]}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[#3F0D12]">{emp.user_details?.username}</h3>
                            <p className="text-xs text-[#D72638] font-bold uppercase">{emp.job_title || 'No Title'}</p>
                        </div>
                    </div>
                    {emp.is_available ? 
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Active</span> : 
                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Off</span>
                    }
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                    <div className="flex items-center gap-1"><Briefcase size={14}/> <b>Exp:</b> {emp.years_of_experience} Yrs</div>
                    <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500"/> <b>{emp.rating}</b> ({emp.review_count})</div>
                    <div className="flex items-center gap-1"><DollarSign size={14}/> <b>Comm:</b> {emp.commission_rate}%</div>
                    <div className="flex items-center gap-1 text-green-700 font-bold"><DollarSign size={14}/> <b>₹{emp.wallet_balance}</b></div>
                </div>

                <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                    <Clock size={12}/> Shift: {emp.shift_start || 'Not Set'} - {emp.shift_end || 'Not Set'}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-auto">
                    {/* 🔥 View Attendance Toggle Button */}
                    <button 
                        onClick={() => toggleAttendance(emp.id)} 
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-1 transition
                        ${expandedEmpId === emp.id ? 'bg-[#3F0D12] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {expandedEmpId === emp.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>} 
                        {expandedEmpId === emp.id ? 'Hide Log' : 'Attendance'}
                    </button>

                    <button onClick={() => handleEdit(emp)} className="p-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                        <Edit size={16}/>
                    </button>
                    <button onClick={() => handleDelete(emp.id)} className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition">
                        <Trash2 size={16}/>
                    </button>
                </div>

                {/* 🔥 EXPANDABLE ATTENDANCE LIST (DROPDOWN) */}
                {expandedEmpId === emp.id && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-fade-in-down">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <Clock size={12}/> Recent Logs
                        </h4>
                        
                        {loadingAttendance && !attendanceData[emp.id] ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400" size={20}/></div>
                        ) : attendanceData[emp.id]?.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 py-2">No logs found.</p>
                        ) : (
                            <div className="max-h-40 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                                {attendanceData[emp.id]?.map(att => (
                                    <div key={att.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <span className="font-bold text-gray-700">{att.date}</span>
                                        <div className="flex gap-3">
                                            <span className="text-green-600 font-bold">IN: {att.check_in ? att.check_in.slice(0,5) : '--'}</span>
                                            <span className="text-red-500 font-bold">OUT: {att.check_out ? att.check_out.slice(0,5) : '--'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        ))}
      </div>
      )}

      {/* Modal - Add/Edit */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl relative animate-fade-in-up max-h-[90vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-3xl">
                    <h2 className="text-2xl font-bold text-[#3F0D12]">{isEditing ? 'Edit Profile' : 'New Employee'}</h2>
                    <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-black"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Username *" className="p-3 border rounded-xl" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                        <input type="text" placeholder="Phone *" className="p-3 border rounded-xl" required value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <input type="email" placeholder="Email *" className="w-full p-3 border rounded-xl" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        {!isEditing && <input type="password" placeholder="Password *" className="w-full p-3 border rounded-xl" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Job Title" className="p-3 border rounded-xl" value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} />
                        <input type="number" placeholder="Experience" className="p-3 border rounded-xl" value={formData.years_of_experience} onChange={e => setFormData({...formData, years_of_experience: e.target.value})} />
                        <input type="number" placeholder="Commission %" className="p-3 border rounded-xl" value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: e.target.value})} />
                    </div>
                    
                    <textarea placeholder="Bio (Optional)" className="w-full p-3 border rounded-xl" rows="2" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase flex items-center gap-2"><Briefcase size={14}/> Optional Details</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div><label className="text-xs text-gray-500">Wallet</label><input type="number" className="w-full p-2 border rounded-lg" value={formData.wallet_balance} onChange={e => setFormData({...formData, wallet_balance: e.target.value})} /></div>
                            <div><label className="text-xs text-gray-500">Rating</label><input type="number" step="0.1" className="w-full p-2 border rounded-lg" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} /></div>
                            <div><label className="text-xs text-gray-500">Reviews</label><input type="number" className="w-full p-2 border rounded-lg" value={formData.review_count} onChange={e => setFormData({...formData, review_count: e.target.value})} /></div>
                            <div className="flex items-center gap-2 pt-4">
                                <input type="checkbox" className="w-5 h-5 accent-[#3F0D12]" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} />
                                <label className="text-sm font-bold">Active</label>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-xs text-gray-500">Shift Start</label><input type="time" className="w-full p-2 border rounded-lg" value={formData.shift_start} onChange={e => setFormData({...formData, shift_start: e.target.value})} /></div>
                             <div><label className="text-xs text-gray-500">Shift End</label><input type="time" className="w-full p-2 border rounded-lg" value={formData.shift_end} onChange={e => setFormData({...formData, shift_end: e.target.value})} /></div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-[#3F0D12] text-white rounded-xl font-bold hover:bg-[#5a1a20] transition shadow-lg">
                        {isEditing ? 'Save Changes' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminEmployees;