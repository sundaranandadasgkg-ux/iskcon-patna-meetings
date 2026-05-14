import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Gavel, MessageSquare, User, Save, CheckCircle2 } from 'lucide-react';

const MeetingFloor = () => {
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);
    const [updates, setUpdates] = useState({}); // Draft notes save karne ke liye

    const fetchApproved = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/agendas/approved-for-meeting', {
                headers: { 'x-auth-token': token }
            });
            setAgendas(res.data);
        } catch (err) {
            console.error("Error fetching floor agendas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (token) fetchApproved(); }, [token]);

    const handleInputChange = (id, field, value) => {
        setUpdates({ ...updates, [id]: { ...updates[id], [field]: value } });
    };

    const handleFinalize = async (id) => {
        try {
            const dataToUpdate = updates[id];
            // AAPKE BACKEND ROUTE #8 KE HISAB SE
            await axios.patch(`http://localhost:5000/api/agendas/update-meeting-details/${id}`, 
                dataToUpdate,
                { headers: { 'x-auth-token': token } }
            );
            alert("Agenda Discussed and Saved!");
            setAgendas(agendas.filter(a => a._id !== id)); // List se hata do kyunki discuss ho gaya
        } catch (err) {
            alert("Update fail ho gaya!");
        }
    };

    if (loading) return <div className="p-10 text-center text-orange-600">Loading Floor...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <Gavel className="text-orange-600" size={32} />
                <h2 className="text-2xl font-bold text-gray-800">Agenda on Floor (In Discussion)</h2>
            </div>

            {agendas.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl text-center border shadow-sm text-gray-400">
                    Bhai, discussion ke liye abhi koi approved agenda nahi hai.
                </div>
            ) : (
                <div className="space-y-6">
                    {agendas.map((agenda) => (
                        <div key={agenda._id} className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-green-500">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-gray-800">{agenda.title}</h3>
                                <p className="text-gray-600 mt-1">{agenda.description}</p>
                                <p className="text-xs text-blue-500 mt-2 font-bold uppercase">Submitted By: {agenda.submittedBy?.name}</p>
                            </div>

                            <hr className="my-4" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-1 mb-2">
                                        <MessageSquare size={16}/> Meeting Notes (Kyah tay hua?)
                                    </label>
                                    <textarea 
                                        className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Discussion ke main points yahan likhein..."
                                        rows="3"
                                        onChange={(e) => handleInputChange(agenda._id, 'meetingNotes', e.target.value)}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-1 mb-2">
                                        <User size={16}/> Responsible Person (Kaun karega?)
                                    </label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Member ka naam..."
                                        onChange={(e) => handleInputChange(agenda._id, 'responsiblePerson', e.target.value)}
                                    />
                                    <button 
                                        onClick={() => handleFinalize(agenda._id)}
                                        className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all"
                                    >
                                        <Save size={18} /> Finish Discussion
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MeetingFloor;