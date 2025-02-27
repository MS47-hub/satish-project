import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Star, Upload, LogOut } from 'lucide-react';

const CustomerPage: React.FC = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState<{ [key: number]: { product: any, quantity: number } }>({});
    const [reviews, setReviews] = useState<{ [key: number]: string }>({});
    const [ratings, setRatings] = useState<{ [key: number]: number }>({});
    const [showCart, setShowCart] = useState(false);
    const [loginActivity, setLoginActivity] = useState([]);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [category, setCategory] = useState("");
    const [photos, setPhotos] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, loginRes, photosRes] = await Promise.all([
                    fetch('http://localhost:8000/products').then(res => res.json()),
                    fetch('http://localhost:8000/login-activity', {
                        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                    }).then(res => res.json()),
                    fetch('http://localhost:8000/photos').then(res => res.json())
                ]);
                setProducts(productsRes);
                setLoginActivity(loginRes);
                setPhotos(photosRes);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8000/photos/categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleLogout = () => navigate("/");

    const handleAddToCart = (product) => {
        setCart(prevCart => {
            const updatedCart = { ...prevCart };
            if (updatedCart[product.id]) {
                updatedCart[product.id].quantity += 1;
            } else {
                updatedCart[product.id] = { product, quantity: 1 };
            }
            return updatedCart;
        });
    };

    const handlePhotoUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photoFile) return;
        const formData = new FormData();
        formData.append('uploaded_file', photoFile);
        formData.append('category', category);
        try {
            const response = await fetch('http://localhost:8000/photos/upload', {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.ok) {
                alert('Photo uploaded successfully!');
                setPhotoFile(null);
                setCategory("");
                setPhotos(await (await fetch('http://localhost:8000/photos')).json());
            } else {
                alert('Failed to upload photo.');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
        }
    };

    const filteredPhotos = photos.filter(photo => 
        !selectedCategory || photo.category === selectedCategory
    );

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex justify-between items-center shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold">Customer Portal</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowCart(true)} className="relative">
                        <ShoppingCart className="w-8 h-8 text-white" />
                        {Object.keys(cart).length > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{Object.keys(cart).length}</span>
                        )}
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-md">
                        <LogOut /> Logout
                    </button>
                </div>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold text-center text-gray-800">Our Products</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {products.map(product => (
                            <div key={product.id} className="bg-white shadow-md rounded-lg p-6 hover:scale-105 transition-transform">
                                <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                                <h2 className="text-2xl font-semibold text-gray-800">{product.name}</h2>
                                <p className="text-gray-600 mt-2">{product.description}</p>
                                <p className="font-bold text-lg text-blue-700 mt-2">Price: ${product.price}</p>
                                <button onClick={() => handleAddToCart(product)} className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 shadow-md w-full">Add to Cart</button>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h2 className="text-xl font-bold bg-white p-4 rounded-lg shadow-md">Recent Login Activity</h2>
                    <ul className="bg-white p-4 mt-4 rounded-lg shadow-md">
                        {loginActivity.map(activity => (
                            <li key={activity.id} className="border-b py-2">{activity.timestamp} - {activity.username}</li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <div className="mt-10">
                <h1 className="text-3xl font-bold text-center text-gray-800">Upload a Photo</h1>
                <form onSubmit={handlePhotoUpload} className="flex flex-col items-center gap-4 mt-4">
                    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files![0])} required className="border p-2 rounded" />
                    <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required className="border p-2 rounded" />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <Upload /> Upload Photo
                    </button>
                </form>
            </div>
            
            <h2 className="text-3xl font-bold mt-6 text-center text-gray-800">Photo Gallery</h2>
            <select onChange={(e) => setSelectedCategory(e.target.value)} className="mt-4">
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {filteredPhotos.map(photo => (
                    <div key={photo.id} className="bg-white shadow-md rounded-lg p-4">
                        <img src={photo.url} alt="Uploaded" className="w-full h-48 object-cover rounded-lg mb-2" />
                        <p className="text-gray-600">Category: {photo.category}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerPage;
