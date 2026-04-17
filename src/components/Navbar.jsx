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

const PremiumBadge = ({ label }) => (
    <span className="badge-premium-gold">
        <svg className="w-2.5 h-2.5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span className="relative z-10">{label}</span>
    </span>
);

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
    const isPremium = membership !== 'basic';

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
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg text-black cyber-btn
                        bg-gradient-to-r from-cyan-400 to-sky-500
                        hover:from-cyan-300 hover:to-sky-400
                        shadow-[0_0_15px_rgba(14,165,233,0.4)]
                        hover:shadow-[0_0_25px_rgba(14,165,233,0.6)]
                        transition-all duration-200
                        ${active ? 'ring-2 ring-cyan-400/60' : ''}`}
                >
                    {Icon && <Icon />}
                    {label}
                </Link>
            );
        }
        return (
            <Link
                to={to}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                    ${active
                        ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                        : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-400/8'
                    }`}
            >
                {Icon && <Icon />}
                {label}
                {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(14,165,233,0.8)]" />
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Top accent line */}
            <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70" />

            <nav className={`fixed top-[2px] left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? 'bg-[#020817]/95 backdrop-blur-xl border-b border-cyan-500/15 shadow-[0_4px_30px_rgba(14,165,233,0.08)]'
                    : 'bg-[#020817]/80 backdrop-blur-md border-b border-white/5'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-[72px] gap-3">

                        {/* Back Button */}
                        {!isHome && (
                            <motion.button
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => navigate(-1)}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-400/30 transition-all shrink-0"
                                aria-label="Go back"
                            >
                                <Icons.Back />
                            </motion.button>
                        )}

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 shrink-0 group">
                            <div className="relative w-9 h-9 rounded-lg flex items-center justify-center text-black font-black text-sm shadow-lg transition-all duration-300
                                bg-gradient-to-br from-cyan-400 to-sky-500
                                shadow-[0_0_15px_rgba(14,165,233,0.4)]
                                group-hover:shadow-[0_0_25px_rgba(14,165,233,0.6)]
                                group-hover:scale-105">
                                B
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#020817] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                            </div>

                            <span className="font-black tracking-tight">
                                <span className="sm:hidden text-lg text-white">BTIX</span>
                                <span className="hidden sm:inline text-xl">
                                    <span className="text-gradient-cyan">BTIX</span>
                                    <span className="text-slate-400"> ID</span>
                                </span>
                            </span>
                        </Link>

                        {/* Separator */}
                        <div className="hidden md:block h-5 w-px bg-slate-700/60 mx-1" />

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
                                        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl
                                            bg-slate-800/70 hover:bg-slate-700/80
                                            border border-slate-700/80 hover:border-cyan-400/30
                                            transition-all duration-200 group"
                                    >
                                        {/* Avatar */}
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-black text-xs font-black uppercase shadow-sm
                                            bg-gradient-to-br from-cyan-400 to-sky-500
                                            shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="text-left leading-none">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-bold text-slate-200">{user.name.split(' ')[0]}</p>
                                                {isPremium && <PremiumBadge label={membershipLabel} />}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Lihat Profil</p>
                                        </div>
                                        <span className={`transition-transform duration-200 text-slate-500 ${userMenuOpen ? 'rotate-180' : ''}`}>
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
                                                className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50
                                                    bg-[#060f1e]/95 backdrop-blur-xl
                                                    border border-cyan-500/15
                                                    shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(14,165,233,0.05)]"
                                            >
                                                {/* Header */}
                                                <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Logged in as</p>
                                                    <p className="text-sm font-bold text-slate-200 truncate mt-0.5">{user.email}</p>
                                                    {isPremium && (
                                                        <div className="mt-2">
                                                            <PremiumBadge label={`✦ ${membershipLabel} Member`} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-1.5">
                                                    <Link
                                                        to="/membership"
                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-cyan-400/8 hover:text-cyan-300 rounded-lg transition-colors"
                                                    >
                                                        <Icons.Membership />
                                                        Langganan
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors"
                                                    >
                                                        <Icons.Logout />
                                                        Keluar
                                                    </button>
                                                </div>
                                                {/* bottom accent */}
                                                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-cyan-300 hover:bg-cyan-400/8 rounded-xl transition-all">
                                        Masuk
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-5 py-2 text-sm font-bold text-black rounded-xl cyber-btn
                                            bg-gradient-to-r from-cyan-400 to-sky-500
                                            shadow-[0_0_15px_rgba(14,165,233,0.4)]
                                            hover:shadow-[0_0_25px_rgba(14,165,233,0.6)]"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-all"
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
                            className="md:hidden border-t border-slate-700/50 bg-[#060f1e]/98 backdrop-blur-xl overflow-hidden"
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
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive(to)
                                            ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                        }`}
                                    >
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive(to) ? 'bg-cyan-400/15 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                                            <Icon />
                                        </span>
                                        {label}
                                    </Link>
                                ))}

                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin/scanner"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-black
                                            bg-gradient-to-r from-cyan-400 to-sky-500
                                            shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
                                            <Icons.Scanner />
                                        </span>
                                        Scan Tiket
                                    </Link>
                                )}

                                <div className="pt-3 mt-2 border-t border-slate-700/50">
                                    {user ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black shadow-sm
                                                    bg-gradient-to-br from-cyan-400 to-sky-500">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                    {isPremium && <div className="mt-1"><PremiumBadge label={membershipLabel} /></div>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/20 transition-all"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                                    <Icons.Logout />
                                                </span>
                                                Keluar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Link to="/login" className="flex-1 text-center px-4 py-3 text-sm font-semibold text-slate-400 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all">
                                                Masuk
                                            </Link>
                                            <Link to="/register" className="flex-1 text-center px-4 py-3 text-sm font-bold text-black rounded-xl
                                                bg-gradient-to-r from-cyan-400 to-sky-500
                                                shadow-[0_0_12px_rgba(14,165,233,0.3)]">
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
