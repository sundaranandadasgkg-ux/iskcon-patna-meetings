import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = ({ token }) => {
    const [pending, setPending] = useState([]);

    const loadPending = async () => {
        const res = await axios.get('http://iskcon-patna-meetings-1.onrender.com/api/agendas/admin/pending', {
            headers: { 'x-auth-token': token }
        });
        setPending(res.data);
    };

    const approve = async (id) => {
        await axios.put(`http://iskcon-patna-meetings-1.onrender.com/api/agendas/approve/${id}`, { status: 'approved' }, {
            headers: { 'x-auth-token': token }
        });
        loadPending(); // Refresh list
    };

    useEffect(() => { loadPending(); }, []);

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
            {pending.map(item => (
                <div key={item._id} className="flex justify-between items-center p-4 border-b">
                    <div>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-sm text-gray-500">By: {item.submittedBy?.name}</p>
                    </div>
                    <button onClick={() => approve(item._id)} className="bg-green-600 text-white px-4 py-2 rounded font-bold">Approve</button>
                </div>
            ))}
        </div>
    );
};

export default AdminPanel;