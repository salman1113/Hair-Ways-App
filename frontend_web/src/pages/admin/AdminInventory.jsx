import React, { useState, useEffect } from 'react';
import { getProducts, createProduct } from '../../services/api';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', stock_quantity: '', price: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
      const data = await getProducts();
      setProducts(data);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
        await createProduct(newProduct);
        alert("Product Added!");
        setNewProduct({ name: '', stock_quantity: '', price: '' });
        fetchData();
    } catch (error) { alert("Failed to add product"); }
  };

  return (
    <div>
        <h1 className="text-3xl font-serif font-bold text-[#3F0D12] mb-8">Store Inventory</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-lg h-fit">
                <h3 className="font-bold text-lg mb-4 text-[#3F0D12]">Add Product</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                    <input type="text" placeholder="Product Name" className="w-full p-3 border rounded-xl" required
                        value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                    <input type="number" placeholder="Stock" className="w-full p-3 border rounded-xl" required
                        value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
                    <input type="number" placeholder="Cost" className="w-full p-3 border rounded-xl" required
                        value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <button type="submit" className="w-full py-3 bg-[#3F0D12] text-white rounded-xl font-bold">Add to Stock</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm">
                <table className="w-full text-left">
                    <thead><tr className="text-[#785A5D] border-b"><th className="pb-3">Product</th><th className="pb-3">Stock</th><th className="pb-3">Price</th></tr></thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="border-b last:border-0">
                                <td className="py-3 font-bold text-[#3F0D12]">{p.name}</td>
                                <td className={`py-3 font-bold ${p.stock_quantity < 5 ? 'text-red-500' : 'text-green-600'}`}>{p.stock_quantity} units</td>
                                <td className="py-3 text-gray-500">₹{p.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
export default AdminInventory;