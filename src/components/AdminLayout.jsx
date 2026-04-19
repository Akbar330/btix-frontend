import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

const navItems = [
    { label: 'Dashboard', path: '/admin', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { label: 'Events', path: '/admin/tickets', icon: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v13a2 2 0 01-2 2zM7 7h10M7 11h10M7 15h7' },
    { label: 'Banners', path: '/admin/banners', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm4 11v3h8v-3' },
    { label: 'Vouchers', path: '/admin/vouchers', icon: 'M15 5l-1.41 1.41L15 7.83 17.17 10H13v2h4.17l-2.17 2.17L16.41 15 19 12.41 21.59 15l1.41-1.41L20.83 11 23 8.83 21.59 7.41 19 10 16.41 7.41 15 8.83z' },
    { label: 'Payments', path: '/admin/payments', icon: 'M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM3 6h18v4H3V6zm0 12v-6h18v6H3z' },
    { label: 'Scanner', path: '/admin/scanner', icon: 'M4 7h2v2H4zm0 4h2v2H4zm4-4h2v2H8zm0 4h2v2H8zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2zm-8 4h2v2H8zm4 0h2v2h-2zm4 0h2v2h-2zM4 15h2v2H4z' },
];

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-[rgba(13,43,87,0.08)] bg-white shadow-[10px_0_40px_rgba(16,39,74,0.04)]">
                <div className="flex h-full flex-col">
                    <div className="flex h-20 items-center border-b border-[rgba(13,43,87,0.06)] px-8">
                        <Link to="/" className="tix-brand text-2xl leading-none">
                            BTIX<span className="tix-brand-mark" />ID
                        </Link>
                    </div>

                    <nav className="flex-1 space-y-1.5 px-4 py-8">
                        <p className="mb-4 px-4 text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                            Management
                        </p>
                        {navItems.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className={`group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-extrabold transition-all duration-300 ${
                                        active
                                            ? 'bg-[rgba(13,43,87,0.05)] text-[var(--brand-navy)] shadow-[inset_0_0_0_1px_rgba(13,43,87,0.08)]'
                                            : 'text-[var(--text-muted)] hover:bg-[rgba(13,43,87,0.03)] hover:text-[var(--brand-navy)]'
                                    }`}
                                >
                                    <svg
                                        className={`h-5 w-5 transition-colors ${
                                            active ? 'text-[var(--brand-gold)]' : 'text-[var(--text-muted)] group-hover:text-[var(--brand-gold)]'
                                        }`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d={item.icon} />
                                    </svg>
                                    {item.label}
                                    {active && (
                                        <motion.div
                                            layoutId="active-nav-pill"
                                            className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--brand-gold)]"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-[rgba(13,43,87,0.06)] p-6">
                        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[rgba(13,43,87,0.03)] p-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-navy)] text-xs font-bold text-white">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-extrabold text-[var(--brand-navy)]">{user?.name}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-gold)]">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-rose-600 transition hover:bg-rose-50"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1">
                <div className="px-8 py-8 md:px-12 md:py-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
