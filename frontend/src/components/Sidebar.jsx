import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Path check kar lena bhai
import { 
  LayoutDashboard, 
  FilePlus, 
  LogOut, 
  ClipboardList, 
  MessageSquare, 
  Users, 
  ShieldCheck,
  UserPlus,
  Gavel
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    // 1. AuthContext se 'user' nikalye. 
    // Login ke waqt aapka backend jo data bhejta hai, wo isi 'user' mein hota hai.
    const { user, logout } = useContext(AuthContext); 




    // 2. Role ko handle karein (Schema ke hisaab se 'role' small letters mein)
    const userRole = user?.role; 
    console.log("Current User in Sidebar:", user);

    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
        { id: 'submit', name: 'Submit Agenda', icon: <FilePlus size={20}/> },
        { id: 'floor', name: 'Agenda on Floor', icon: <MessageSquare size={20}/> },
        { id: 'history', name: 'History (Done)', icon: <ClipboardList size={20}/> },
        
    ];

    // 3. Admin logic: Agar role 'admin' hai toh list mein add karo
    if (userRole === 'admin') {
        menuItems.push({ id: 'register', name: 'Add New Member', icon: <UserPlus size={20}/> });
        menuItems.push({ id: 'users', name: 'Manage Members', icon: <Users size={20}/> });
        menuItems.push({ id: 'admin-approval', name: 'Admin Approval', icon: <ShieldCheck size={20}/> });
    } 


    return (
        <div className="w-64 bg-white h-screen shadow-lg flex flex-col font-sans">
            <div className="p-6 border-b bg-orange-50/30">
                <h1 className="text-xl font-bold text-orange-600">ISKCON Patna</h1>
                {user && (
                    <div className="mt-2">
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <p className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">
                            {userRole}
                        </p>
                    </div>
                )}
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            activeTab === item.id 
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-200' 
                            : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                        }`}
                    >
                        {item.icon}
                        <span className="font-semibold">{item.name}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t bg-gray-50">
                <button 
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                >
                    <LogOut size={20}/>
                    <span className="font-bold">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;