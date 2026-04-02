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
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-white 
                        bg-gradient-to-r from-violet-600 to-primary-600 
                        shadow-lg shadow-primary-500/30
                        hover:shadow-primary-500/50 hover:scale-[1.03]
                        active:scale-[0.98]
                        transition-all duration-200
                        ${active ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-transparent' : ''}`}
                >
                    {Icon && <Icon />}
                    {label}
                    {active && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border border-white animate-pulse" />}
                </Link>
            );
        }
        return (
            <Link
                to={to}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200
                    ${active
                        ? 'text-primary-600 bg-primary-50 shadow-sm shadow-primary-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
            >
                {Icon && <Icon />}
                {label}
                {active && (
                    <motion.span
                        layoutId="navbar-pill"
                        className="absolute inset-0 rounded-xl bg-primary-50 -z-10"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
            </Link>
        );
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.07)]'
                : 'bg-white/60 backdrop-blur-md border-b border-white/50'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-[60px] gap-2">

                        {/* Back Button */}
                        {!isHome && (
                            <motion.button
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => navigate(-1)}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                                aria-label="Go back"
                            >
                                <Icons.Back />
                            </motion.button>
                        )}

                        {/* Logo */}
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 shrink-0 group mr-2">
                            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 via-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 group-hover:scale-105 transition-all duration-200">
                                B
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-[1.5px] border-white" />
                            </div>

                            {/* FIX DISINI */}
                            <span className="font-black tracking-tight text-slate-900">
                                {/* Mobile */}
                                <span className="sm:hidden text-base">
                                    BTIX.ID
                                </span>

                                {/* Desktop */}
                                <span className="hidden sm:inline text-lg">
                                    BANGSA{" "}
                                    <span className="bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">
                                        TIX.ID
                                    </span>
                                </span>
                            </span>
                        </Link>

                        {/* Separator */}
                        <div className="hidden md:block h-5 w-px bg-slate-200 mx-1" />

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
                                        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 transition-all duration-200 group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 via-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black uppercase shadow-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="text-left leading-none">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-bold text-slate-900">{user.name.split(' ')[0]}</p>
                                                {membership !== 'basic' && (
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${
                                                        membership === 'premium' 
                                                            ? 'bg-amber-100 text-amber-700 border-amber-200' 
                                                            : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                                    }`}>
                                                        {membershipLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium">Lihat Profil</p>
                                        </div>
                                        <span className={`transition-transform duration-200 text-slate-400 ${userMenuOpen ? 'rotate-180' : ''}`}>
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
                                                className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/40">
                                                    <p className="text-xs text-slate-400">Logged in as</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                                                </div>
                                                <div className="p-1.5">
                                                    <Link
                                                        to="/membership"
                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                                                    >
                                                        <Icons.Membership />
                                                        Langganan
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
                                    <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                                        Masuk
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-5 py-2 text-sm font-bold text-white rounded-xl
                                            bg-gradient-to-r from-primary-500 to-violet-600
                                            shadow-md shadow-primary-500/25 hover:shadow-primary-500/40
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
                            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
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
                            className="md:hidden border-t border-slate-100/80 bg-white/95 backdrop-blur-xl overflow-hidden"
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
                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                            : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive(to) ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <Icon />
                                        </span>
                                        {label}
                                    </Link>
                                ))}

                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin/scanner"
                                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-primary-600 shadow-md shadow-primary-500/25"
                                    >
                                        <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Icons.Scanner />
                                        </span>
                                        Scan Tiket
                                    </Link>
                                )}

                                <div className="pt-3 mt-2 border-t border-slate-100">
                                    {user ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-primary-50/50 rounded-2xl border border-slate-100">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-violet-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <span className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                                                    <Icons.Logout />
                                                </span>
                                                Keluar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Link to="/login" className="flex-1 text-center px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
                                                Masuk
                                            </Link>
                                            <Link to="/register" className="flex-1 text-center px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-2xl shadow-md shadow-primary-500/25 transition-colors">
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
