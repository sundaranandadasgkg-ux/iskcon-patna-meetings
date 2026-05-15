import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { History, Calendar, UserCheck, ClipboardList, Search, RotateCcw, Trash2 } from 'lucide-react';

const MeetingHistory = () => {
    const { token, user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/agendas/final-history', {
                    headers: { 'x-auth-token': token }
                });
                
                // --- DUPLICATE HATANE KA LOGIC ---
                const uniqueData = res.data.reduce((acc, current) => {
                    const x = acc.find(item => item._id === current._id);
                    if (!x) return acc.concat([current]);
                    else return acc;
                }, []);

                setHistory(uniqueData);
            } catch (err) {
                console.error("History fetch failed");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchHistory();
    }, [token]);

    // --- ADMIN ACTION: SEND BACK TO DISCUSSION ---
    // --- ADMIN ACTION: SEND BACK TO DISCUSSION (URL Fixed) ---
    const handleSendBack = async (id) => {
        if (!window.confirm("Is agenda ko wapas Discussion Floor par bhejna hai?")) return;
        try {
            // URL mein '/admin' add kar diya hai aapke backend route ke hisaab se
            await axios.patch(`http://localhost:5000/api/agendas/admin/update-status/${id}`, 
                { status: 'approved' }, 
                { headers: { 'x-auth-token': token } }
            );
            
            // List se remove karna taaki UI update ho jaye
            setHistory(prev => prev.filter(item => item._id !== id));
            alert("Sent back to Discussion Floor successfully!");
        } catch (err) {
            console.error("Send Back Error:", err.response?.data || err.message);
            alert("Action failed: Backend route mismatch or permission issue");
        }
    };

    // --- ADMIN ACTION: DELETE PERMANENTLY ---
    const handleDelete = async (id) => {
        if (!window.confirm("Kya aap sure hain? Ye agenda hamesha ke liye delete ho jayega!")) return;
        try {
            await axios.delete(`http://localhost:5000/api/agendas/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setHistory(prev => prev.filter(item => item._id !== id));
            alert("Deleted successfully");
        } catch (err) {
            alert("Delete failed");
        }
    };

    const filteredHistory = history.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.responsiblePerson?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center font-bold text-gray-500 italic animate-pulse">History load ho rahi hai...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <History size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800">Meeting Minutes</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Archived & Completed Sewas</p>
                    </div>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search agenda or person..."
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl w-full md:w-80 outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 transition-all shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Section */}
            <div className="grid gap-6">
                {filteredHistory.map((item) => (
                    <div key={item._id} className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        {/* Card Top Bar */}
                        <div className="bg-gray-50/50 px-6 py-4 border-b flex justify-between items-center">
                            <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                <Calendar size={14} className="text-blue-500" /> {new Date(item.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm shadow-blue-100">
                                    {item.department || item.panel || 'General'}
                                </span>
                                
                                {/* --- ADMIN BUTTONS (TOP RIGHT) --- */}
                                {user?.role === 'admin' && (
                                    <div className="flex items-center gap-1 ml-4 pl-4 border-l border-gray-200">
                                        <button 
                                            onClick={() => handleSendBack(item._id)}
                                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                            title="Send Back to Floor"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Permanently"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{item.title}</h3>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <ClipboardList size={16} className="text-orange-500" /> Final Meeting Notes
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 italic border border-gray-100 leading-relaxed shadow-inner">
                                        "{item.meetingNotes || 'No final notes recorded.'}"
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <UserCheck size={16} className="text-green-500" /> Execution Details
                                    </h4>
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center font-black shadow-lg shadow-blue-100">
                                            {item.responsiblePerson?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">{item.responsiblePerson || 'Not Assigned'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Responsible Person</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase italic">Ref ID: {item._id.slice(-6)}</p>
                                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredHistory.length === 0 && (
                    <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                             <History size={40} />
                        </div>
                        <h3 className="text-gray-500 font-bold">No records found.</h3>
                        <p className="text-xs text-gray-400">Try searching with a different term.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingHistory;