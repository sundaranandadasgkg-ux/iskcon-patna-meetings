import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Clock, CheckCircle, MessageSquare, ArrowUpRight } from 'lucide-react';

const DashboardStats = () => {
    const [stats, setStats] = useState({ pending: 0, approved: 0, discussed: 0 });
    const [recentDiscussed, setRecentDiscussed] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Aapke backend ka 'history' route use kar rahe hain jo saare data deta hai
                const res = await axios.get('http://localhost:5000/api/agendas/history', {
                    headers: { 'x-auth-token': token }
                });
                
                const data = res.data;
                setStats({
                    pending: data.filter(a => a.status === 'pending').length,
                    approved: data.filter(a => a.status === 'approved').length,
                    discussed: data.filter(a => a.status === 'discussed').length
                });
                
                // Latest 5 discussed agendas
                setRecentDiscussed(data.filter(a => a.status === 'discussed').slice(0, 5));
            } catch (err) {
                console.error("Dashboard Stats Fetch Error");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchStats();
    }, [token]);

    if (loading) return <div className="p-10 text-center text-gray-500 font-bold">Data loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* --- Stats Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-orange-500 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.pending}</h3>
                    </div>
                    <Clock className="text-orange-100" size={48} />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-green-500 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">On Floor</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.approved}</h3>
                    </div>
                    <CheckCircle className="text-green-100" size={48} />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-600 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Discussed</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.discussed}</h3>
                    </div>
                    <MessageSquare className="text-blue-100" size={48} />
                </div>
            </div>

            {/* --- Recent Action Points Table --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <LayoutDashboard size={20} className="text-blue-600" /> Recent Action Points
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase font-black text-gray-400 tracking-tighter bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4">Agenda</th>
                                <th className="px-6 py-4">Responsible Person</th>
                                <th className="px-6 py-4">Resolution Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentDiscussed.map((item) => (
                                <tr key={item._id} className="hover:bg-blue-50/20 transition-all">
                                    <td className="px-6 py-4 font-bold text-gray-800">{item.title}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                                            {item.responsiblePerson || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 italic">
                                        {item.meetingNotes?.substring(0, 60)}...
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;