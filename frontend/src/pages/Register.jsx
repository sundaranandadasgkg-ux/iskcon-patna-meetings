import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Mail, Lock, UserCheck, Building, Loader2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'member',
        department: 'General'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Backend API call (Route aapke setup ke hisaab se check kar lein)
            const res = await axios.post('http://localhost:5000/api/members/register', formData);
            setMessage({ type: 'success', text: 'User Registered Successfully!' });
            // Form reset
            setFormData({ name: '', email: '', password: '', role: 'member', department: 'General' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="text-orange-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Add New Member</h2>
                    <p className="text-gray-500 text-sm">Register a new committee member</p>
                </div>

                {message.text && (
                    <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${
                        message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div className="relative">
                        <UserCheck className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                        />
                    </div>

                    {/* Email Field */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-xs text-gray-500 ml-1">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                <option value="tmc">TMC</option>
                                <option value="zmt">ZMT</option>
                            </select>
                        </div>

                        <div className="relative">
                            <label className="text-xs text-gray-500 ml-1">Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                            >
                                <option value="General">General</option>
                                <option value="Kitchen">Kitchen</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Outreach">Outreach</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Register Member'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;