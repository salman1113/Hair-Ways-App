import React, { useState, useEffect } from 'react';
import { getProducts, createProduct } from '../../services/api';
import { Package, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonTable } from '../../components/SkeletonRow';

const AdminInventory = () => {
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', stock_quantity: '', price: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch {
            toast.error("Failed to load products");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Adding product...");
        try {
            await createProduct(newProduct);
            toast.success("Product Added!", { id: toastId });
            setNewProduct({ name: '', stock_quantity: '', price: '' });
            setShowModal(false);
            fetchData();
        } catch {
            toast.error("Failed to add product", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/80 pb-12">

            {/* ─── Header ─── */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight">Inventory</h1>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Manage products & stock</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full md:w-auto justify-center bg-[#C19D6C] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-[#a6865c] transition shrink-0 text-sm"
                >
                    <Plus size={16} /> Add Product
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-6">

                {/* ─── Product Table ─── */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left text-sm min-w-[500px]"><tbody><SkeletonTable rows={4} cols={3} /></tbody></table>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                        <Package size={40} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-sm font-semibold text-gray-500">No products found</h3>
                        <p className="text-xs text-gray-400 mt-1">Add your first product to get started.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left text-sm min-w-[500px]">
                                <thead className="bg-gray-50 text-[10px] md:text-xs tracking-wider text-gray-400 uppercase border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 md:p-5 font-semibold">Product</th>
                                        <th className="p-4 md:p-5 font-semibold">Stock</th>
                                        <th className="p-4 md:p-5 font-semibold">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50/80 transition">
                                            <td className="p-4 md:p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                                                        <Package size={16} />
                                                    </div>
                                                    <span className="font-semibold text-black">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 md:p-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${p.stock_quantity < 5
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                    {p.stock_quantity} units{p.stock_quantity < 5 ? ' · Low' : ''}
                                                </span>
                                            </td>
                                            <td className="p-4 md:p-5 font-bold text-black">₹{p.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Add Product Modal ─── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[100] p-0 md:p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in-up flex flex-col max-h-[90vh]">
                        <div className="p-5 md:p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
                            <h2 className="text-lg font-bold text-black">New Product</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddProduct} className="p-4 md:p-6 overflow-y-auto w-full space-y-4">
                            <input
                                type="text"
                                placeholder="Product Name"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors"
                                required
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Stock Quantity"
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors"
                                    required
                                    value={newProduct.stock_quantity}
                                    onChange={e => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Price (₹)"
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black text-sm transition-colors"
                                    required
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-[#C19D6C] text-white rounded-lg font-medium hover:bg-[#a6865c] transition text-sm disabled:opacity-40"
                            >
                                {loading ? "Adding..." : "Add to Stock"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInventory;