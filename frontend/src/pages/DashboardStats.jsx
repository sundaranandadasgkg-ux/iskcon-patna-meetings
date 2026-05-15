import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
// ChevronDown aur Send icons add kiye hain expand aur update ke liye
import { LayoutDashboard, Clock, CheckCircle, MessageSquare, ChevronDown, Send, Calendar, User } from 'lucide-react';



const DashboardStats = () => {
    const [stats, setStats] = useState({ pending: 0, approved: 0, discussed: 0 });
    const [recentDiscussed, setRecentDiscussed] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useContext(AuthContext);

    // --- YE TEEN NAYE STATES FILTERS KE LIYE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [panelFilter, setPanelFilter] = useState("All");
    const [responsibleFilter, setResponsibleFilter] = useState("All");

    // --- NAYA STATE: Expansion aur Progress Input ke liye ---
    const [expandedId, setExpandedId] = useState(null); // Kaunsa row khula hai
    const [newUpdate, setNewUpdate] = useState(""); // Naya progress text input
    const [updating, setUpdating] = useState(false); // Loading state for progress update

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/agendas/history', {
                    headers: { 'x-auth-token': token }
                });
                
                const data = res.data;
                setStats({
                    pending: data.filter(a => a.status === 'pending').length,
                    approved: data.filter(a => a.status === 'approved').length,
                    discussed: data.filter(a => a.status === 'discussed').length
                });

                console.log("Database se aaya data:", data[0]);
                
                setRecentDiscussed(data.filter(a => a.status === 'discussed').slice(0, 10)); // Top 10 dikhayenge ab
            } catch (err) {
                console.error("Dashboard Stats Fetch Error");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchStats();
    }, [token]);

    // --- YE LOGIC YAHAN LIKHO (Balle Balle Filters) ---
    const filteredAgendas = recentDiscussed.filter(item => {
        const matchesPanel = panelFilter === "All" || (item.panel || item.department) === panelFilter;
        const matchesPerson = responsibleFilter === "All" || item.responsiblePerson === responsibleFilter;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesPanel && matchesPerson && matchesSearch;
    });

    // Dropdown list banane ke liye unique data
    const uniquePersons = [...new Set(recentDiscussed.map(a => a.responsiblePerson).filter(Boolean))];
    const uniquePanels = [...new Set(recentDiscussed.map(a => a.panel || a.department).filter(Boolean))];

    // --- NAYA FUNCTION: Progress Update Submit karne ke liye ---
    const handleProgressUpdate = async (id) => {
        if (!newUpdate.trim()) return;
        setUpdating(true);
        try {
            const res = await axios.patch(`http://localhost:5000/api/agendas/update-progress/${id}`, 
                { updateText: newUpdate },
                { headers: { 'x-auth-token': token } }
            );
            
            // UI update bina refresh kiye: recentDiscussed mein data badalna
            setRecentDiscussed(prev => prev.map(a => a._id === id ? res.data : a));
            setNewUpdate(""); // Input clear
        } catch (err) {
            alert("Failed to update progress");
        } finally {
            setUpdating(false);
        }
    };

    const handleCompleteTask = async (id) => {
        if (!window.confirm("Is this task fully completed? It will move to history.")) return;
        
        try {
            await axios.patch(`http://localhost:5000/api/agendas/complete-task/${id}`, {}, {
                headers: { 'x-auth-token': token }
            });
            
            // UI se turant hatane ke liye
            setRecentDiscussed(prev => prev.filter(a => a._id !== id));
            setExpandedId(null);
            alert("Sewa marked as Completed! Moved to history.");
        } catch (err) {
            alert("Error completing task");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500 font-bold">Data loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* --- Stats Cards (Aapka purana code unchanged) --- */}
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


            {/* --- YE HAI FILTER BAR KA UI --- */}
            <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center">
                <input 
                    type="text" 
                    placeholder="Search agenda..." 
                    className="flex-1 border-gray-200 rounded-xl"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select className="border-gray-200 rounded-xl" onChange={(e) => setPanelFilter(e.target.value)}>
                    <option value="All">All Panels</option>
                    {uniquePanels.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="border-gray-200 rounded-xl" onChange={(e) => setResponsibleFilter(e.target.value)}>
                    <option value="All">All Responsible</option>
                    {uniquePersons.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>


            {/* --- Recent Action Points List (Modified for Expansion) --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <LayoutDashboard size={20} className="text-blue-600" /> Recent Action Points
                    </h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {filteredAgendas.map((item) => (
                        <div key={item._id} className="group">
                            {/* Main Row */}
                            <div 
                                onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                                className={`flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-gray-50 transition-all ${expandedId === item._id ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                        {item.description || item.agendaDescription || "No description available"}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Responsible</p>
                                        <span className="text-xs font-bold text-blue-600">{item.responsiblePerson || 'TMC'}</span>
                                    </div>
                                    <ChevronDown 
                                        size={20} 
                                        className={`text-gray-400 transition-transform ${expandedId === item._id ? 'rotate-180' : ''}`} 
                                    />
                                </div>
                            </div>

                            {/* --- NAYA: Expandable Section --- */}
                            {expandedId === item._id && (
                                <div className="px-6 pb-6 bg-blue-50/30 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-4 border-blue-100">
                                        
                                        {/* Left: Discussion & Details */}
                                        <div className="space-y-4">
                                            <div>
                                                <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Discussion Notes</h5>
                                                <div className="bg-white p-4 rounded-xl text-sm text-gray-600 italic border border-blue-100">
                                                    {item.meetingNotes || item.notes || item.discussion || "No notes provided in discussion"}
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white px-3 py-2 rounded-lg border border-blue-100">
                                                    <Calendar size={14} className="text-orange-500" />
                                                    Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white px-3 py-2 rounded-lg border border-blue-100">
                                                    <User size={14} className="text-blue-500" />
                                                    Dept: {item.department || 'General'}
                                                </div>
                                            </div>

                                            {/* Expandable area ke andar, Left column ke niche */}
                                            {/* Discussion Notes ke niche */}
                                            <div className="pt-4">
                                                {/* SIRF ADMIN YA RESPONSIBLE PERSON KO DIKHEGA */}
                                                {(user?.role === 'admin' || user?.name === item.responsiblePerson) ? (
                                                    <button 
                                                        onClick={() => handleCompleteTask(item._id)}
                                                        className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg"
                                                    >
                                                        <CheckCircle size={18} /> Mark as Sewa Completed
                                                    </button>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic">
                                                        Only {item.responsiblePerson || 'assigned person'} can complete this sewa.
                                                    </p>
                                                )}
                                            </div>

                                        </div>

                                        

                                        {/* Right: Progress Updates Timeline */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Progress Timeline</h5>
                                            
                                            {/* Update Input Field */}
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Add current update..."
                                                    className="flex-1 text-sm border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500"
                                                    value={newUpdate}
                                                    onChange={(e) => setNewUpdate(e.target.value)}
                                                />
                                                <button 
                                                    disabled={updating}
                                                    onClick={() => handleProgressUpdate(item._id)}
                                                    className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>

                                            {/* Scrollable Timeline List */}
                                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {item.progressUpdates && item.progressUpdates.length > 0 ? (
                                                    item.progressUpdates.slice().reverse().map((log, idx) => (
                                                        <div key={idx} className="bg-white p-3 rounded-lg border-l-4 border-green-500 shadow-sm relative">
                                                            <p className="text-sm text-gray-700">{log.text}</p>
                                                            <p className="text-[9px] text-gray-400 mt-1 font-bold">
                                                                {new Date(log.updatedAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic">No progress updates yet.</p>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;