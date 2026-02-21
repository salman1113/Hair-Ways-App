import React, { useState, useEffect } from 'react';
import { getServices, createService, deleteService, getCategories, updateService, createCategory, deleteCategory } from '../../services/api';
import { Trash2, Edit, Plus, Image, Clock, Search, FolderPlus, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  
  const initialForm = { name: '', price: '', duration_minutes: '', description: '', image: null, category: '' };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
        const [srvData, catData] = await Promise.all([getServices(), getCategories()]);
        setServices(srvData);
        setCategories(catData);
    } catch (error) { toast.error("Failed to load data"); }
  };

  // --- FILTER LOGIC ---
  const filteredServices = services.filter(srv => {
      const matchesTab = activeTab === 'ALL' || srv.category === Number(activeTab);
      const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
  });

  // --- HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.error("Please select a category!");
    
    setLoading(true);
    const toastId = toast.loading(isEditing ? "Updating..." : "Adding Service...");

    try {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('duration_minutes', formData.duration_minutes);
        data.append('description', formData.description);
        data.append('category', formData.category);
        if (formData.image instanceof File) data.append('image', formData.image);

        if (isEditing) {
            await updateService(selectedServiceId, data);
            toast.success("Service Updated!", { id: toastId });
        } else {
            await createService(data);
            toast.success("Service Added!", { id: toastId });
        }
        
        setShowModal(false);
        setFormData(initialForm);
        fetchData();
    } catch (error) {
        console.error(error);
        toast.error("Operation Failed", { id: toastId });
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Delete this service?")) {
          const toastId = toast.loading("Deleting...");
          try {
              await deleteService(id);
              toast.success("Deleted", { id: toastId });
              fetchData();
          } catch { toast.error("Failed", { id: toastId }); }
      }
  };

  const handleEdit = (srv) => {
      setIsEditing(true);
      setSelectedServiceId(srv.id);
      setFormData({
          name: srv.name,
          price: srv.price,
          duration_minutes: srv.duration_minutes,
          description: srv.description,
          category: srv.category,
          image: srv.image // Keep old image url if not changed
      });
      setShowModal(true);
  };

  const openAddModal = () => {
      setIsEditing(false);
      setFormData(initialForm);
      setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        <Toaster position="top-center"/>

        {/* HEADER */}
        <div className="bg-white border-b px-6 py-5 sticky top-0 z-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl font-serif font-bold text-[#3F0D12]">Service Menu</h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Manage Treatments & Pricing</p>
            </div>
            <button onClick={openAddModal} className="bg-[#3F0D12] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#5a1a20] transition shadow-lg">
                <Plus size={18}/> Add Service
            </button>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
            
            {/* SEARCH & TABS */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Search Services..." 
                        className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-[#3F0D12] bg-white shadow-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <button 
                        onClick={() => setActiveTab('ALL')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border
                        ${activeTab === 'ALL' ? 'bg-[#3F0D12] text-white border-[#3F0D12]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                    >
                        All Services
                    </button>
                    {categories.map(cat => (
                        <button key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border
                            ${activeTab === cat.id ? 'bg-[#3F0D12] text-white border-[#3F0D12]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* SERVICE GRID */}
            {filteredServices.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-medium">No services found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map(srv => (
                        <div key={srv.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                            
                            {/* Image & Price */}
                            <div className="relative h-40 w-full rounded-xl overflow-hidden mb-4 bg-gray-100">
                                <img 
                                    src={srv.image || "https://via.placeholder.com/300"} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    alt={srv.name}
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-black text-[#3F0D12] shadow-sm">
                                    ₹{srv.price}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="mb-4">
                                <h3 className="font-bold text-lg text-[#3F0D12] mb-1">{srv.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{srv.description}</p>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
                                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                    <Clock size={14}/> {srv.duration_minutes} Mins
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(srv)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                        <Edit size={18}/>
                                    </button>
                                    <button onClick={() => handleDelete(srv.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>

        {/* MODAL */}
        {showModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative animate-fade-in-up">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[#3F0D12]">{isEditing ? 'Edit Service' : 'New Service'}</h2>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black"><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <input type="text" placeholder="Service Name" className="w-full p-3 border rounded-xl outline-none focus:ring-1 focus:ring-[#3F0D12]" 
                            required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Price (₹)" className="w-full p-3 border rounded-xl outline-none focus:ring-1 focus:ring-[#3F0D12]" 
                                required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                            <input type="number" placeholder="Duration (Mins)" className="w-full p-3 border rounded-xl outline-none focus:ring-1 focus:ring-[#3F0D12]" 
                                required value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})} />
                        </div>

                        <select className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#3F0D12]" 
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>

                        <textarea placeholder="Description" rows="3" className="w-full p-3 border rounded-xl outline-none focus:ring-1 focus:ring-[#3F0D12]"
                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFormData({...formData, image: e.target.files[0]})} />
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Image size={24}/>
                                <span className="text-xs font-bold">{formData.image ? "Image Selected" : "Upload Image"}</span>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3 bg-[#3F0D12] text-white rounded-xl font-bold hover:bg-[#5a1a20] transition shadow-lg">
                            {loading ? "Saving..." : (isEditing ? "Update Service" : "Create Service")}
                        </button>
                    </form>
                </div>
            </div>
        )}

    </div>
  );
};

export default AdminServices;