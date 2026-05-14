import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AgendaFloor = ({ token }) => {
    const [floorAgendas, setFloorAgendas] = useState([]);

    useEffect(() => {
        const fetchFloor = async () => {
            const res = await axios.get('http://localhost:5000/api/agendas/on-floor', {
                headers: { 'x-auth-token': token }
            });
            setFloorAgendas(res.data);
        };
        fetchFloor();
    }, [token]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Current Agenda on Floor</h2>
            {floorAgendas.map(item => (
                <div key={item._id} className="p-6 bg-white border-2 border-orange-500 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-gray-600 mt-2">{item.description}</p>
                    <div className="mt-4 flex justify-between items-center text-sm font-bold text-orange-600">
                        <span>By: {item.submittedBy?.name}</span>
                        <span>Panel: {item.panel}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AgendaFloor;