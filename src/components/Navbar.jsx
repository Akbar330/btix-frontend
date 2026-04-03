import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Icons = {
    Home: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    Ticket: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
    ),
    Dashboard: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
    ),
    Scanner: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10V5a2 2 0 012-2h5m4 0h5a2 2 0 012 2v5m-18 4v5a2 2 0 002 2h5m4 0h5a2 2 0 002-2v-5" />
        </svg>
    ),
    Logout: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    Membership: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
        </svg>
    ),
    Back: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    ChevronDown: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
    ),
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const isHome = location.pathname === '/';
    const membership = user?.membership || 'basic';
    const membershipLabel = typeof membership === 'string' ? membership.toUpperCase() : 'BASIC';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label, highlight }) => {
        const active = isActive(to);
        if (highlight) {
            return (
                <Link
                    to={to}
                    className={`relative flex items-center gap-2 px-5 py-2.5 text-base font-bold rounded-lg text-black 
                        bg-amber-400
                        hover:bg-amber-500 hover:scale-[1.02]
                        active:scale-[0.98]
                        transition-all duration-200
                        ${active ? 'ring-2 ring-amber-600/30' : ''}`}
                >
                    {Icon && <Icon />}
                    {label}
                </Link>
            );
        }
        return (
            <Link
                to={to}
                className={`relative flex items-center gap-2 px-5 py-2.5 text-base font-bold rounded-lg transition-all duration-200
                    ${active
                        ? 'text-amber-500 bg-gray-900/10'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
            >
                {Icon && <Icon />}
                {label}
            </Link>
        );
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-gray-900 border-b border-amber-500/30 shadow-lg'
                : 'bg-gray-800 border-b border-amber-500/20'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-[90px] gap-3">

                        {/* Back Button */}
                        {!isHome && (
                            <motion.button
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => navigate(-1)}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors shrink-0"
                                aria-label="Go back"
                            >
                                <Icons.Back />
                            </motion.button>
                        )}

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 shrink-0 group">
                            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 group-hover:scale-105 transition-all duration-200">
                                B
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-[1.5px] border-white" />
                            </div>

                            <span className="font-black tracking-tight text-white">
                                {/* Mobile */}
                                <span className="sm:hidden text-lg">
                                    BTIX
                                </span>

                                {/* Desktop */}
                                <span className="hidden sm:inline text-2xl">
                                    <span className="text-amber-400">BTIX</span> ID
                                </span>
                            </span>
                        </Link>

                        {/* Separator */}
                        <div className="hidden md:block h-5 w-px bg-gray-700 mx-1" />

                        {/* Center Nav Links */}
                        <div className="hidden md:flex items-center gap-0.5">
                            <NavItem to="/" icon={Icons.Home} label="Home" />

                            {user && (
                                <>
                                    <NavItem to="/history" icon={Icons.Ticket} label="Tiket Saya" />
                                    <NavItem to="/membership" icon={Icons.Membership} label="Membership" />
                                </>
                            )}

                            {user?.role === 'admin' && (
                                <>
                                    <NavItem to="/admin" icon={Icons.Dashboard} label="Dashboard" />
                                    <NavItem to="/admin/scanner" icon={Icons.Scanner} label="Scanner" highlight />
                                </>
                            )}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Right: user actions */}
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-amber-500/50 transition-all duration-200 group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-black text-xs font-black uppercase shadow-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="text-left leading-none">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-bold text-white">{user.name.split(' ')[0]}</p>
                                                {membership !== 'basic' && (
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${
                                                        membership === 'premium' 
                                                            ? 'bg-amber-500/30 text-amber-300 border-amber-500/60' 
                                                            : 'bg-amber-500/30 text-amber-300 border-amber-500/60'
                                                    }`}>
                                                        {membershipLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-medium">Lihat Profil</p>
                                        </div>
                                        <span className={`transition-transform duration-200 text-gray-400 ${userMenuOpen ? 'rotate-180' : ''}`}>
                                            <Icons.ChevronDown />
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                                                    <p className="text-xs text-gray-500">Logged in as</p>
                                                    <p className="text-sm font-bold text-white truncate">{user.email}</p>
                                                </div>
                                                <div className="p-1.5">
                                                    <Link
                                                        to="/membership"
                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:text-amber-400 rounded-lg transition-colors"
                                                    >
                                                        <Icons.Membership />
                                                        Langganan
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:text-red-400 rounded-lg transition-colors"
                                                    >
                                                        <Icons.Logout />
                                                        Keluar
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="px-5 py-2.5 text-base font-semibold text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-colors">
                                        Masuk
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-2.5 text-base font-bold text-black rounded-xl
                                            bg-amber-500 hover:bg-amber-600
                                            shadow-md shadow-amber-500/25 hover:shadow-amber-500/40
                                            hover:scale-[1.03] active:scale-[0.98]
                                            transition-all duration-200"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menu"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {mobileMenuOpen ? (
                                    <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </motion.svg>
                                ) : (
                                    <motion.svg key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </motion.svg>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden border-t border-gray-700 bg-gray-800 overflow-hidden"
                        >
                            <div className="px-4 pt-3 pb-4 space-y-1">
                                {[
                                    { to: '/', icon: Icons.Home, label: 'Home', show: true },
                                    { to: '/history', icon: Icons.Ticket, label: 'Tiket Saya', show: !!user },
                                    { to: '/membership', icon: Icons.Membership, label: 'Upgrade Membership', show: !!user },
                                    { to: '/admin', icon: Icons.Dashboard, label: 'Admin Dashboard', show: user?.role === 'admin' },
                                ].filter(item => item.show).map(({ to, icon: Icon, label }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${isActive(to)
                                            ? 'bg-amber-500/30 text-amber-400 shadow-sm'
                                            : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                            }`}
                                    >
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive(to) ? 'bg-amber-500/30 text-amber-400' : 'bg-gray-700 text-gray-400'}`}>
                                            <Icon />
                                        </span>
                                        {label}
                                    </Link>
                                ))}

                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin/scanner"
                                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-black bg-amber-500 shadow-lg shadow-amber-500/25"
                                    >
                                        <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Icons.Scanner />
                                        </span>
                                        Scan Tiket
                                    </Link>
                                )}

                                <div className="pt-3 mt-2 border-t border-gray-700">
                                    {user ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-2xl border border-gray-600">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-black font-black shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                                            >
                                                <span className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                                                    <Icons.Logout />
                                                </span>
                                                Keluar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Link to="/login" className="flex-1 text-center px-4 py-3 text-sm font-semibold text-gray-400 border border-gray-700 rounded-2xl hover:bg-gray-700 transition-colors">
                                                Masuk
                                            </Link>
                                            <Link to="/register" className="flex-1 text-center px-4 py-3 text-sm font-bold text-black bg-amber-500 rounded-2xl shadow-md shadow-amber-500/25 transition-colors">
                                                Daftar
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}
