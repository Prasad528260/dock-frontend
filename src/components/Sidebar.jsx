import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, BarChart3, Truck } from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/simulation', icon: Activity, label: 'Simulation' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const Sidebar = () => {
    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <Truck className="text-blue-400" size={24} />
                    <div>
                        <h1 className="text-white font-bold text-sm">DockScheduler</h1>
                        <p className="text-gray-500 text-xs">Logistics Control</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-gray-800">
                <p className="text-gray-600 text-xs text-center">v1.0.0</p>
            </div>
        </aside>
    );
};

export default Sidebar;