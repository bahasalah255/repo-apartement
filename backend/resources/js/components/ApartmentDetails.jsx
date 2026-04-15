import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Calendar, Euro, MapPin, Tag, ChevronLeft, CreditCard } from 'lucide-react';
import AvailabilityCalendar from './AvailabilityCalendar';

const ApartmentDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reservationLoading, setReservationLoading] = useState(false);
    
    // Dates de réservation
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
    const [phone, setPhone] = useState('');

    useEffect(() => {
        axios.get(`/api/apartments/${id}`)
            .then(response => {
                setApartment(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur:", error);
                setLoading(false);
            });
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            toast.error("Veuillez vous connecter pour réserver.");
            return navigate('/login');
        }

        setReservationLoading(true);
        try {
            await axios.post('/api/reservations', {
                apartment_id: apartment.id,
                check_in: format(startDate, 'yyyy-MM-dd'),
                check_out: format(endDate, 'yyyy-MM-dd'),
                phone: phone,
                special_requests: ''
            });
            toast.success("Réservation effectuée avec succès !");
            navigate('/');
        } catch (error) {
            const message = error.response?.data?.message || "Une erreur est survenue lors de la réservation.";
            toast.error(message);
        } finally {
            setReservationLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    
    if (!apartment) return (
        <div className="max-w-md mx-auto my-20 text-center bg-white p-12 rounded-2xl shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-800 italic-none">Appartement non trouvé</h2>
            <Link to="/" className="mt-4 text-blue-600 hover:text-blue-700 font-medium inline-block">Retour à l'accueil</Link>
        </div>
    );

    const nights = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * apartment.price_per_night;

    return (
        <div className="max-w-5xl mx-auto italic-none pb-20">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-medium transition-colors group">
                <div className="bg-white p-1.5 rounded-lg border group-hover:border-blue-600 group-hover:bg-blue-50 transition-all">
                    <ChevronLeft size={16} />
                </div>
                Retour aux appartements
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Contenu Principal */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                        {/* Placeholder pour image */}
                        <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-300 relative">
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                           <Tag size={48} />
                        </div>
                        
                        <div className="p-10">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Premium</span>
                                <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Disponible</span>
                            </div>

                            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">{apartment.name}</h1>
                            
                            <div className="flex items-center gap-6 text-gray-500 mb-8 pb-8 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-blue-500" />
                                    <span className="font-medium">Centre-ville</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Euro size={18} className="text-blue-500" />
                                    <span className="font-medium">{apartment.price_per_night} DH / nuit</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-4 italic-none">À propos de ce logement</h3>
                            <p className="text-gray-600 leading-relaxed text-lg italic-none">
                                {apartment.description}
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>
                    </div>

                    <AvailabilityCalendar apartmentId={id} />
                </div>

                {/* Barre Latérale de Réservation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-24 transform hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <span className="text-3xl font-black text-blue-600">{apartment.price_per_night} DH</span>
                                <span className="text-gray-400 text-sm italic-none font-medium"> / nuit</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest italic-none">Total estimé</span>
                                <span className="text-xl font-bold text-gray-900">{totalPrice} DH</span>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1 italic-none">Arrivée</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" size={18} />
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={new Date()}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium"
                                        placeholderText="Choisir date"
                                    />
                                </div>
                            </div>

                            <div className="relative mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1 italic-none">Départ</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" size={18} />
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium"
                                        placeholderText="Choisir date"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1 italic-none">Téléphone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium"
                                placeholder="Votre numéro de téléphone"
                                required
                            />
                        </div>

                        <ul className="space-y-3 mb-8">
                            <li className="flex justify-between text-sm text-gray-500 italic-none">
                                <span>{apartment.price_per_night} DH x {nights} nuits</span>
                                <span>{totalPrice} DH</span>
                            </li>
                            <li className="flex justify-between text-sm text-gray-500 italic-none">
                                <span>Frais de service</span>
                                <span>0 DH</span>
                            </li>
                            <li className="pt-3 border-t flex justify-between font-bold text-gray-900 text-lg italic-none">
                                <span>Total</span>
                                <span className="text-blue-600">{totalPrice} DH</span>
                            </li>
                        </ul>

                        <button 
                            onClick={handleBooking}
                            disabled={reservationLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 italic-none"
                        >
                            {reservationLoading ? (
                                <div className="animate-spin h-6 w-6 border-2 border-white/50 border-t-white rounded-full"></div>
                            ) : (
                                <>
                                    <CreditCard size={22} />
                                    Réserver mon séjour
                                </>
                            )}
                        </button>
                        
                        {!user && (
                            <p className="mt-4 text-center text-xs text-gray-400 font-medium decoration-none italic-none">
                                Connectez-vous pour finaliser votre réservation
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApartmentDetails;

