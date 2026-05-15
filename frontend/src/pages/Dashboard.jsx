import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AgendaForm from '../components/AgendaForm';
import Register from './Register'; // Pehle upar import karein
import ManageMembers from './ManageMembers';
import AdminApproval from '../components/AdminApproval'; // 1. Check Import
import MeetingFloor from './MeetingFloor';
import MeetingHistory from './MeetingHistory';
import DashboardStats from './DashboardStats';


const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [agendas, setAgendas] = useState([]); // Default empty array
    const { token } = useContext(AuthContext);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://iskcon-patna-meetings-1.onrender.com/api/agendas/me', {
                headers: { 'x-auth-token': token }
            });
            // Humesha check karein ki res.data ek array hai
            setAgendas(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("History fetch error", err);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main className="flex-1 p-8 overflow-y-auto">
                
                {activeTab === 'dashboard' && <DashboardStats />}

                {activeTab === 'submit' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm max-w-2xl border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6">Submit New Agenda</h2>
                        {/* Form yahan aayega agle step mein */}
                        <p className="text-gray-400 italic font-medium text-lg"><AgendaForm /></p>
                    </div>
                )}

                {activeTab === 'register' && <Register />}

                {activeTab === 'history' && <MeetingHistory />}

                {activeTab === 'floor' && <MeetingFloor/>}


                {activeTab === 'admin-approval' && <AdminApproval />}

                {activeTab === 'users' && <ManageMembers />}

                {activeTab === 'admin' && <AdminPanel token={token} />}

            </main>
        </div>
    );
};

export default Dashboard;