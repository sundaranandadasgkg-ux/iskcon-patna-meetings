import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, FileText, Loader2 } from 'lucide-react';

const AdminApproval = () => {
    const [pendingList, setPendingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    const fetchPending = async () => {
        try {
            // AAPKE BACKEND ROUTE #3 KE HISAB SE
            const res = await axios.get('http://iskcon-patna-meetings-1.onrender.com/api/agendas/admin/pending', {
                headers: { 'x-auth-token': token }
            });
            setPendingList(res.data);
        } catch (err) {
            console.error("Error fetching pending agendas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (token) fetchPending(); }, [token]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            // AAPKE BACKEND ROUTE #4 KE HISAB SE (PATCH use kiya hai aapne)
            await axios.patch(`http://iskcon-patna-meetings-1.onrender.com/api/agendas/admin/update-status/${id}`, 
                { status: newStatus },
                { headers: { 'x-auth-token': token } }
            );
            
            setPendingList(pendingList.filter(item => item._id !== id));
            alert(`Agenda ${newStatus} ho gaya!`);
        } catch (err) {
            alert("Action failed!");
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading Agendas...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Clock className="text-orange-600" /> Pending Approvals
            </h2>

            {pendingList.length === 0 ? (
                <p className="text-gray-500 bg-white p-10 rounded-xl border border-dashed text-center">Koi naya agenda pending nahi hai.</p>
            ) : (
                <div className="space-y-4">
                    {pendingList.map((agenda) => (
                        <div key={agenda._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{agenda.title}</h3>
                                <p className="text-gray-600 text-sm">{agenda.description}</p>
                                <p className="text-xs text-orange-500 mt-2 font-medium">Submitted by: {agenda.submittedBy?.name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleStatusUpdate(agenda._id, 'approved')}
                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                                >
                                    <CheckCircle size={24} />
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate(agenda._id, 'rejected')}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminApproval;