import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { History, Calendar, UserCheck, ClipboardList, Search } from 'lucide-react';

const MeetingHistory = () => {
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/agendas/final-history', {
                    headers: { 'x-auth-token': token }
                });
                setHistory(res.data);
            } catch (err) {
                console.error("History fetch failed");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchHistory();
    }, [token]);

    // Search logic (Title ya Responsible person ke naam se dhundo)
    const filteredHistory = history.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.responsiblePerson?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">History load ho rahi hai...</div>;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <History className="text-blue-600" size={32} />
                    <h2 className="text-2xl font-bold text-gray-800">Meeting Minutes & History</h2>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search agenda or person..."
                        className="pl-10 pr-4 py-2 border rounded-xl w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6">
                {filteredHistory.map((item) => (
                    <div key={item._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
                            <span className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                                <Calendar size={14} /> {new Date(item.updatedAt).toLocaleDateString('en-IN')}
                            </span>
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-md font-bold uppercase">
                                {item.department || 'General'}
                            </span>
                        </div>
                        
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                            
                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-gray-400 flex items-center gap-1">
                                        <ClipboardList size={16} /> Meeting Notes
                                    </h4>
                                    <p className="text-gray-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100 italic text-sm">
                                        "{item.meetingNotes || 'No notes added.'}"
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-gray-400 flex items-center gap-1">
                                        <UserCheck size={16} /> Assigned To
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                            {item.responsiblePerson?.charAt(0) || '?'}
                                        </div>
                                        <span className="font-bold text-gray-700">
                                            {item.responsiblePerson || 'Not Assigned'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Submitted by: {item.submittedBy?.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredHistory.length === 0 && (
                    <div className="text-center p-20 bg-white rounded-2xl border border-dashed text-gray-400">
                        Koi records nahi mile.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingHistory;