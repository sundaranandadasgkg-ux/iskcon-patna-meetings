import React, { useState, useEffect, useContext } from 'react'; // 1. useContext add karein
import { AuthContext } from '../context/AuthContext'; //
import axios from 'axios';
import { Trash2, UserCog, Mail, Shield, Loader2 } from 'lucide-react';

const ManageMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    // 1. Data Fetch Karne ka function
    const fetchMembers = async () => {
        try {
            const res = await axios.get('http://iskcon-patna-meetings-1.onrender.com/api/members/all', {
                headers: { 'x-auth-token': token }
            });
            setMembers(res.data);
        } catch (err) {
            console.error("Error fetching members", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchMembers();
    }, [token]);

    // 2. Delete Karne ka function
    const handleDelete = async (id) => {
        if (window.confirm("Bhai, kya aap sach mein is member ko hatana chahte hain?")) {
            try {
                await axios.delete(`http://iskcon-patna-meetings-1.onrender.com/api/members/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setMembers(members.filter(m => m._id !== id)); // List se turant hata do
            } catch (err) {
                alert("Nahi hata paye!");
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-orange-600" size={40} />
        </div>
    );

    return (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
                <UserCog className="text-orange-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-800">Manage Committee Members</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Name & Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {members.map((member) => (
                            <tr key={member._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{member.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Mail size={12} /> {member.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {member.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm font-medium">
                                    {member.department}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleDelete(member._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                        title="Delete Member"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {members.length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                        Koi members nahi mile!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageMembers;