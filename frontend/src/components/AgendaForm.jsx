import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AgendaForm = () => {
    const { token } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [priority, setPriority] = useState('Medium');
    const [panel, setPanel] = useState('TMC');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Humne backend mein header mein 'x-auth-token' rakha tha
            const config = {
                headers: { 'x-auth-token': token }
            };

            await axios.post('http://localhost:5000/api/agendas/submit', 
                { title, description, priority, panel }, config);

            alert("Prabhu ji, Agenda Submit ho gaya hai! (Pending for Approval)");
            setTitle('');
            setDescription('');
        } catch (err) {
            alert(err.response?.data?.msg || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meeting Panel Selection */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Panel</label>
                    <select 
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                        value={panel}
                        onChange={(e) => setPanel(e.target.value)}
                    >
                        <option value="TMC">TMC (Temple Management)</option>
                        <option value="ZMT">ZMT (Zonal Management)</option>
                    </select>
                </div>

                {/* Priority Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select 
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent 🔥</option>
                    </select>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Agenda Title</label>
                <input 
                    type="text" 
                    placeholder="e.g., Flower decoration for Janmashtami"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description / Details</label>
                <textarea 
                    rows="5"
                    placeholder="Describe the plan in detail..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                ></textarea>
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-bold transition shadow-lg ${
                    loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'
                }`}
            >
                {loading ? 'Submitting...' : 'Submit to Committee'}
            </button>
        </form>
    );
};

export default AgendaForm;