import React, { useState, useEffect } from 'react';
import { getServices, createService, deleteService, getCategories, updateService, createCategory, deleteCategory } from '../../services/api';
import { Trash2, Edit, Plus, Image, Clock, Search, FolderPlus, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';

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
        if (window.confirm("Delete this service?")) {
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
            image: srv.image
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData(initialForm);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50/80 pb-12">

            {/* ─── Header ─── */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight">Services</h1>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Manage treatments & pricing</p>
                </div>
                <button onClick={openAddModal} className="w-full md:w-auto justify-center bg-[#C19D6C] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-[#a6865c] transition shrink-0 text-sm">
                    <Plus size={16} /> Add Service
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-6 space-y-6">

                {/* ─── Search & Tabs ─── */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Services..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-black bg-white text-sm transition-colors"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                        <button
                            onClick={() => setActiveTab('ALL')}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border snap-start shrink-0
                        ${activeTab === 'ALL' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-black'}`}
                        >
                            All Services
                        </button>
                        {categories.map(cat => (
                            <button key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border snap-start shrink-0
                            ${activeTab === cat.id ? 'bg-[#C19D6C] text-white border-[#C19D6C]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-black'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Service Table ─── */}
                {filteredServices.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                        <Package size={40} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-sm font-semibold text-gray-500">No services found</h3>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search constraints.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] md:text-xs tracking-wider text-gray-400 uppercase">
                                        <th className="p-4 md:p-5 font-semibold">Service</th>
                                        <th className="p-4 md:p-5 font-semibold">Category</th>
                                        <th className="p-4 md:p-5 font-semibold">Duration</th>
                                        <th className="p-4 md:p-5 font-semibold">Price</th>
                                        <th className="p-4 md:p-5 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredServices.map(srv => {
                                        const catObj = categories.find(c => c.id === srv.category);
                                        const catName = catObj ? catObj.name : 'Uncategorized';

                                        return (
                                            <tr key={srv.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="p-4 md:p-5">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={srv.image || "https://via.placeholder.com/150"}
                                                            alt={srv.name}
                                                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-black">{srv.name}</p>
                                                            <p className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{srv.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 md:p-5">
                                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                                        {catName}
                                                    </span>
                                                </td>
                                                <td className="p-4 md:p-5">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                                        <Clock size={13} className="text-emerald-500" /> {srv.duration_minutes} Mins
                                                    </div>
                                                </td>
                                                <td className="p-4 md:p-5 font-bold text-black">
                                                    ₹{srv.price}
                                                </td>
                                                <td className="p-4 md:p-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(srv)}
                                                            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-black rounded-lg transition"
                                                            title="Edit Service"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(srv.id)}
                                                            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-black rounded-lg transition"
                                                            title="Delete Service"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* ─── Add/Edit Modal ─── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[100] p-0 md:p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up">
                        <div className="p-5 md:p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
                            <h2 className="text-lg font-bold text-black">{isEditing ? 'Edit Service' : 'New Service'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black transition"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto w-full space-y-4">
                            <input type="text" placeholder="Service Name" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors"
                                required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Price (₹)" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors"
                                    required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                <input type="number" placeholder="Duration (Mins)" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors"
                                    required value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })} />
                            </div>

                            <select className="w-full p-3 border border-gray-200 rounded-lg bg-white outline-none focus:border-black text-sm transition-colors"
                                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>

                            <textarea placeholder="Description" rows="3" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>

                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition relative">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <Image size={20} />
                                    <span className="text-xs font-medium">{formData.image ? "Image Selected" : "Upload Image"}</span>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-3 bg-[#C19D6C] text-white rounded-lg font-medium hover:bg-[#a6865c] transition text-sm">
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