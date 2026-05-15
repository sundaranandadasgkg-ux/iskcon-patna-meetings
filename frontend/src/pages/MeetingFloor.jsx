import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MeetingFloor = () => {
    const [allAgendas, setAllAgendas] = useState([]); 
    const [panel, setPanel] = useState(''); 
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(false);

    // Sabse pehle data load karo
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const config = { headers: { 'x-auth-token': token } };

                const [agendaRes, userRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/agendas/approved-for-meeting', config),
                    axios.get('http://localhost:5000/api/members/all', config)
                ]);

                const normalizedData = agendaRes.data.map(a => ({
                    ...a,
                    meetingNotes: a.meetingNotes || a.notes || "• " 
                }));

                setAllAgendas(normalizedData);
                setUsers(userRes.data);
            } catch (err) {
                console.error("Loading error:", err);
            }
        };
        loadInitialData();
    }, []);

    // --- Common Update Function (State ko sync rakhne ke liye) ---
    const updateLocalState = (id, field, value) => {
        setAllAgendas(prev => prev.map(a => 
            a._id === id ? { ...a, [field]: value } : a
        ));
    };

    // --- KEEP BUTTON: Sirf Database update ---
    const handleUpdateOnly = async (agenda) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            const updateData = {
                meetingNotes: agenda.meetingNotes,
                responsiblePerson: agenda.responsiblePerson,
                dueDate: agenda.dueDate,
                department: agenda.panel
            };

            await axios.patch(
                `http://localhost:5000/api/agendas/update-meeting-details/${agenda._id}`, 
                updateData, 
                config
            );

            alert("Notes saved successfully!");
        } catch (err) {
            alert("Update failed!");
        }
    };

    // --- MOVE BUTTON: Dashboard bhejna aur list se hatana ---
    const handleSaveIndividual = async (agenda) => {
        if (!agenda.meetingNotes || agenda.meetingNotes.trim() === "" || agenda.meetingNotes === "• ") {
            return alert("Pehle notes likhein!");
        }

        if (!window.confirm("Finalize karke Dashboard bhejein?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/agendas/move-to-dashboard/${agenda._id}`, {
                status: 'discussed',
                meetingNotes: agenda.meetingNotes, 
                responsiblePerson: agenda.responsiblePerson,
                dueDate: agenda.dueDate
            }, { headers: { 'x-auth-token': token } });

            // Permanent remove from local state
            setAllAgendas(prev => prev.filter(a => a._id !== agenda._id));
            alert("Balle Balle! Dashboard par bhej diya gaya.");
        } catch (err) {
            alert("Move failed!");
        }
    };

    // Smart Notes Bullet Point Logic
    const handleNotesKeyPress = (e, id, currentNotes) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateLocalState(id, 'meetingNotes', currentNotes + "\n• ");
        }
    };

    // Current filter ke hisaab se data dikhao
    const displayedAgendas = panel 
        ? allAgendas.filter(a => a.panel === panel) 
        : [];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-sm mb-8 flex items-center justify-between border-b-4 border-orange-500">
                <div className="flex gap-4">
                    <select 
                        className="bg-gray-100 border-none rounded-xl px-4 py-2 font-bold outline-none"
                        value={panel}
                        onChange={(e) => setPanel(e.target.value)}
                    >
                        <option value="">Select Panel</option>
                        <option value="ZMT">ZMT</option>
                        <option value="TMC">TMC</option>
                    </select>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-black text-gray-800">MEETING FLOOR</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto space-y-6">
                {displayedAgendas.map((item, index) => (
                    <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center p-4 gap-6 bg-slate-50/50 border-b">
                            <div className="h-8 w-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                            </div>
                            <div className="flex-1 font-bold text-gray-800">{item.title}</div>

                            <div>
                                <select 
                                    className="text-sm border-gray-200 rounded-lg"
                                    value={item.responsiblePerson || ""}
                                    onChange={(e) => updateLocalState(item._id, 'responsiblePerson', e.target.value)}
                                >
                                    <option value="">Responsible</option>
                                    {users.map(u => <option key={u._id} value={u.name}>{u.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <input 
                                    type="date" 
                                    className="text-sm border-gray-200 rounded-lg" 
                                    value={item.dueDate ? item.dueDate.split('T')[0] : ""} 
                                    onChange={(e) => updateLocalState(item._id, 'dueDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-4">
                            <textarea 
                                className="w-full p-4 bg-orange-50/30 border-none rounded-xl text-sm italic focus:ring-0"
                                rows="4"
                                value={item.meetingNotes || ""}
                                onKeyDown={(e) => handleNotesKeyPress(e, item._id, item.meetingNotes)}
                                onChange={(e) => updateLocalState(item._id, 'meetingNotes', e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 px-4 pb-4">
                            <button onClick={() => handleUpdateOnly(item)} className="px-5 py-2 bg-slate-100 rounded-xl text-sm">⏳ Keep</button>
                            <button onClick={() => handleSaveIndividual(item)} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm">✓ Move</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MeetingFloor;