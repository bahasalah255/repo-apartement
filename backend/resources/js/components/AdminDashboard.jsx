import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});

    useEffect(() => {
        // Fetch stats from API (need to create endpoint)
        axios.get('/api/admin/stats').then(response => setStats(response.data));
    }, []);

    if (user?.role !== 'admin') return <div>Access denied</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3>Apartments</h3>
                    <p>{stats.apartments}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3>Reservations</h3>
                    <p>{stats.reservations}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3>Revenue</h3>
                    <p>{stats.revenue} DH</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3>Pending</h3>
                    <p>{stats.pending}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;