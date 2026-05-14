import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = ({ token }) => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const res = await axios.get('http://localhost:5000/api/users/all', {
            headers: { 'x-auth-token': token }
        });
        setUsers(res.data);
    };

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        try {
            await axios.put(`http://localhost:5000/api/users/update-role/${userId}`, 
                { role: newRole }, 
                { headers: { 'x-auth-token': token } }
            );
            fetchUsers(); // List refresh karein
        } catch (err) { alert("Permission Denied!"); }
    };

    useEffect(() => { fetchUsers(); }, []);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Manage Community Roles</h2>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b text-gray-400 text-sm">
                        <th className="pb-4">NAME</th>
                        <th className="pb-4">EMAIL</th>
                        <th className="pb-4">ROLE</th>
                        <th className="pb-4 text-right">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u._id} className="border-b last:border-0">
                            <td className="py-4 font-bold">{u.name}</td>
                            <td className="py-4 text-gray-500">{u.email}</td>
                            <td className="py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="py-4 text-right">
                                <button onClick={() => toggleRole(u._id, u.role)} className="text-orange-600 font-bold hover:underline">
                                    {u.role === 'admin' ? 'Demote' : 'Promote to Admin'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};