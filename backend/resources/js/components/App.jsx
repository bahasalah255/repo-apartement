import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApartmentDetails from './ApartmentDetails';
import Login from './Login';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Home, LogIn } from 'lucide-react';

const ApartmentList = () => {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [maxPrice, setMaxPrice] = useState(500);

    const fetchApartments = () => {
        setLoading(true);
        axios.get('/api/apartments', {
            params: {
                search: search,
                max_price: maxPrice,
            },
        })
            .then((response) => {
                setApartments(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Erreur:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchApartments();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, maxPrice]);

    return (
        <div>
            <div className="mb-8 flex flex-col gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row">
                <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-gray-700 italic-none">Rechercher</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ex: Rez-de-chaussée, Centre-ville..."
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full md:w-64">
                    <label className="mb-1 block text-sm font-medium text-gray-700 italic-none">Prix max: {maxPrice} DH</label>
                    <input
                        type="range"
                        min="20"
                        max="1000"
                        step="10"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {apartments.length === 0 ? (
                        <p className="col-span-full py-10 text-center text-gray-400">Aucun résultat trouvé pour votre recherche.</p>
                    ) : (
                        apartments.map((apt) => (
                            <div key={apt.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl italic-none">
                                <div className="p-6">
                                    <h2 className="mb-2 text-xl font-bold text-gray-800">{apt.name}</h2>
                                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{apt.description}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xl font-bold text-blue-600">
                                            {apt.price_per_night} DH
                                            <span className="text-xs font-normal text-gray-400"> / nuit</span>
                                        </span>
                                        <Link to={`/apartment/${apt.id}`} className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                                            Détails
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const App = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Erreur de déconnexion", error);
        }
    };

    if (loading) return null; // Ne pas afficher le loader global ici pour éviter les flashes de chargement

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar dynamique */}
            <nav className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                        <Home size={20} />
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">rbnb</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex flex-col text-right">
                                <span className="text-sm font-semibold text-gray-700 leading-none">{user.name}</span>
                                <span className="text-xs text-gray-400 mt-1">{user.email}</span>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-full text-blue-600 border border-blue-100">
                                <User size={20} />
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                                title="Se déconnecter"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link 
                            to="/login" 
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md active:scale-95"
                        >
                            <LogIn size={18} />
                            Connexion
                        </Link>
                    )}
                </div>
            </nav>

            <main className="container mx-auto p-4 flex-grow py-8 italic-none">
                <Routes>
                    <Route path="/" element={<ApartmentList />} />
                    <Route path="/apartment/:id" element={<ApartmentDetails />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </main>

            <footer className="bg-white border-t border-gray-100 py-8 text-center mt-auto">
                <p className="text-gray-400 text-sm">© 2026 rbnb - Système de réservation moderne</p>
            </footer>
        </div>
    );
};


export default App;


