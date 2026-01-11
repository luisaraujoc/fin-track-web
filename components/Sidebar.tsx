'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ArrowRightLeft,
    CreditCard,
    PieChart,
    Target,
    Settings,
    LogOut, FileText
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: ArrowRightLeft, label: 'Transações', href: '/transactions' },
    { icon: FileText, label: 'Faturas', href: '/invoices' },
    { icon: CreditCard, label: 'Meus Cartões', href: '/cards' },
    { icon: PieChart, label: 'Relatórios', href: '/reports' },
    { icon: Target, label: 'Planejamento', href: '/planning' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-10">
            {/* Logo */}
            <div className="h-16 flex items-center px-8 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-emerald-600 tracking-tight">
                    Fin-Track
                </h1>
            </div>

            {/* Menu Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    // Verifica se o link é a página ativa
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                ${isActive
                                ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon
                                className={`w-5 h-5 mr-3 transition-colors
                  ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}
                `}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sair
                </button>
            </div>
        </aside>
    );
}