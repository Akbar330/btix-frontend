import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as motionLib } from 'framer-motion';

const SocialIcon = ({ path }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d={path} />
    </svg>
);

const socialIcons = {
    instagram: 'M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5Zm8.75 1.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 6.25A5.75 5.75 0 1 1 6.25 12 5.76 5.76 0 0 1 12 6.25Zm0 1.5A4.25 4.25 0 1 0 16.25 12 4.25 4.25 0 0 0 12 7.75Z',
    youtube: 'M21.58 7.19a2.93 2.93 0 0 0-2.06-2.07C17.66 4.6 12 4.6 12 4.6s-5.66 0-7.52.52A2.93 2.93 0 0 0 2.42 7.2 30.67 30.67 0 0 0 2 12a30.67 30.67 0 0 0 .42 4.81 2.93 2.93 0 0 0 2.06 2.07c1.86.52 7.52.52 7.52.52s5.66 0 7.52-.52a2.93 2.93 0 0 0 2.06-2.07A30.67 30.67 0 0 0 22 12a30.67 30.67 0 0 0-.42-4.81ZM10 15.5v-7l6 3.5Z',
    facebook: 'M13.5 22v-8.2h2.77l.42-3.2H13.5V8.56c0-.93.27-1.56 1.62-1.56h1.73V4.13A23.38 23.38 0 0 0 14.3 4c-2.52 0-4.25 1.54-4.25 4.37v2.43H7.2v3.2h2.85V22Z',
    twitter: 'M21.5 6.52a6.9 6.9 0 0 1-1.98.54 3.45 3.45 0 0 0 1.51-1.9 6.88 6.88 0 0 1-2.18.83 3.44 3.44 0 0 0-5.86 3.14 9.75 9.75 0 0 1-7.08-3.58 3.44 3.44 0 0 0 1.06 4.59 3.4 3.4 0 0 1-1.56-.43v.05a3.44 3.44 0 0 0 2.76 3.37 3.45 3.45 0 0 1-1.55.06 3.44 3.44 0 0 0 3.21 2.38A6.9 6.9 0 0 1 4.5 17a9.73 9.73 0 0 0 5.27 1.54c6.33 0 9.79-5.24 9.79-9.79l-.01-.45A6.97 6.97 0 0 0 21.5 6.52Z',
};

const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'MY TICKET', href: '/history' },
    { label: 'EXPLORE', href: '/#discover' },
];

function Brand() {
    return (
        <Link to="/" className="tix-brand text-[2rem] sm:text-[2.6rem] leading-none flex items-center">
            BTIX.ID
        </Link>
    );
}

function PremiumBadge({ label }) {
    return (
        <span className="badge-premium-gold">
            <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {label}
        </span>
    );
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const MotionDiv = motionLib.div;

    const closeMenus = () => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    };

    const jumpToSection = (href) => {
        closeMenus();

        if (!href.includes('#')) {
            navigate(href);
            return;
        }

        const [pathname, hash] = href.split('#');
        const targetPath = pathname || '/';

        if (location.pathname !== targetPath) {
            navigate(href);
            return;
        }

        const element = document.getElementById(hash);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleLogout = async () => {
        closeMenus();
        await logout();
        navigate('/login');
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <div
                className={`w-full transition-all duration-300 bg-white ${
                    scrolled ? 'shadow-md shadow-[rgba(16,39,74,0.08)]' : ''
                }`}
            >
                <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-5 md:px-8 md:py-5">
                    <Brand />

                    <div className="hidden items-center justify-end flex-1 gap-6 lg:flex xl:gap-8">
                        <nav className="flex items-center gap-6 xl:gap-8 mr-2">
                            {navLinks.map((item) => {
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => jumpToSection(item.href)}
                                        className="text-[0.8rem] xl:text-[0.85rem] font-bold tracking-[0.05em] text-black transition hover:text-[var(--brand-gold)]"
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-4 text-[var(--brand-navy)] mr-2">
                            {Object.entries(socialIcons).map(([name, path]) => (
                                <a
                                    key={name}
                                    href="#"
                                    aria-label={name}
                                    className="h-4 w-4 transition hover:scale-110 hover:text-[var(--brand-gold)]"
                                >
                                    <SocialIcon path={path} />
                                </a>
                            ))}
                        </div>

                        {user ? (
                            <div className="relative">
                                {/* The container that becomes integrated when open */}
                                <div className={`relative transition-all duration-300 ${userMenuOpen ? 'bg-white shadow-[0_4px_30px_rgba(13,43,87,0.08)] rounded-[24px_24px_0_0]' : ''}`}>
                                    <button
                                        type="button"
                                        onClick={() => setUserMenuOpen((value) => !value)}
                                        className={`flex items-center gap-3 px-3 py-2 transition-all duration-300 rounded-[24px] ${
                                            userMenuOpen ? 'bg-white' : 'hover:bg-slate-50 active:bg-slate-100'
                                        }`}
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-navy)] text-xs font-extrabold text-white shadow-sm">
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="text-left leading-tight hidden xl:block">
                                            <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)]">
                                                {user.name?.split(' ')[0] || 'Member'}
                                            </div>
                                            <div className="text-[0.65rem] font-semibold text-[var(--text-muted)]">
                                                Account Settings
                                            </div>
                                        </div>
                                        <svg 
                                            className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <MotionDiv
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                className="absolute right-0 top-full w-64 overflow-hidden rounded-[0_0_24px_24px] bg-white shadow-[0_15px_30px_rgba(13,43,87,0.08)]"
                                            >
                                                <div className="px-2 pb-2">
                                                    <div className="mb-1 rounded-[18px] bg-[rgba(13,43,87,0.025)] px-4 py-4">
                                                        <p className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-[var(--brand-gold)]">
                                                            Account Info
                                                        </p>
                                                        <p className="mt-1.5 truncate text-sm font-extrabold text-[var(--brand-navy)]">
                                                            {user.name}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-[0.7rem] font-semibold text-[var(--text-muted)]">
                                                            {user.email}
                                                        </p>
                                                    </div>

                                                    <div className="grid gap-0.5">
                                                        <Link
                                                            to="/history"
                                                            onClick={closeMenus}
                                                            className="flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-sm font-bold text-[var(--brand-navy)] transition-all hover:bg-[rgba(13,43,87,0.04)] group"
                                                        >
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm border border-[rgba(13,43,87,0.04)]">
                                                                <svg className="w-4 h-4 text-[var(--brand-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                            </div>
                                                            Tiket Saya
                                                        </Link>
                                                        
                                                        {user.role === 'admin' && (
                                                            <Link
                                                                to="/admin"
                                                                onClick={closeMenus}
                                                                className="flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-sm font-bold text-[var(--brand-navy)] transition-all hover:bg-[rgba(13,43,87,0.04)] group"
                                                            >
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm border border-[rgba(13,43,87,0.04)]">
                                                                    <svg className="w-4 h-4 text-[var(--brand-navy)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                                </div>
                                                                Admin Dashboard
                                                            </Link>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={handleLogout}
                                                            className="flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-sm font-bold text-rose-600 transition-all hover:bg-rose-50"
                                                        >
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm border border-rose-100">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                            </div>
                                                            Keluar
                                                        </button>
                                                    </div>
                                                </div>
                                            </MotionDiv>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="tix-pill-button px-8 py-2.5 text-[0.8rem] whitespace-nowrap hidden lg:block"
                            >
                                LOGIN
                            </Link>
                        )}

                        {user?.role === 'admin' && (
                            <Link to="/admin/scanner" className="tix-pill-button px-5 py-2.5 text-sm hidden lg:block">
                                Scanner
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((value) => !value)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(13,43,87,0.08)] bg-white text-[var(--brand-navy)] shadow-[0_10px_24px_rgba(16,39,74,0.08)] md:hidden"
                        aria-label="Toggle navigation"
                    >
                        <div className="grid gap-1">
                            <span className="block h-0.5 w-5 rounded-2xl bg-current" />
                            <span className="block h-0.5 w-5 rounded-2xl bg-current" />
                            <span className="block h-0.5 w-5 rounded-2xl bg-current" />
                        </div>
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            <MotionDiv
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeMenus}
                                className="fixed inset-0 z-[60] bg-[rgba(13,43,87,0.4)] backdrop-blur-sm md:hidden"
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0, height: '100vh', width: '100vw' }}
                            />
                            <MotionDiv
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 right-0 z-[70] w-72 bg-[rgba(255,253,248,0.98)] shadow-2xl md:hidden flex flex-col"
                                style={{ position: 'fixed', top: 0, right: 0, bottom: 0, margin: 0, height: '100vh' }}
                            >
                                <div className="flex items-center justify-between p-5 border-b border-[rgba(13,43,87,0.08)]">
                                    <div className="tix-brand text-lg leading-none">
                                        BANGSA TIX<span className="tix-brand-mark" />ID
                                    </div>
                                    <button onClick={closeMenus} className="p-2 text-[var(--brand-navy)] rounded-2xl hover:bg-[rgba(13,43,87,0.05)]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-5 py-6 grid auto-rows-max">
                                    {navLinks.map((item) => (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => jumpToSection(item.href)}
                                            className="px-2 py-4 text-left text-sm font-extrabold tracking-[0.12em] text-black border-b border-[rgba(13,43,87,0.06)] last:border-0"
                                        >
                                            {item.label}
                                        </button>
                                    ))}

                                    {user ? (
                                        <div className="mt-4 border-t border-[rgba(13,43,87,0.08)] grid">
                                            <div className="px-2 mb-2">
                                                <p className="text-xs text-[var(--text-muted)]">Signed in as</p>
                                                <p className="font-bold text-[var(--brand-navy)] truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                to="/history"
                                                onClick={closeMenus}
                                                className="px-2 py-4 text-sm font-extrabold text-[var(--brand-navy)] border-b border-[rgba(13,43,87,0.06)]"
                                            >
                                                Tiket Saya
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="px-2 py-5 text-left text-sm font-extrabold text-rose-600"
                                            >
                                                Keluar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-4 border-t border-[rgba(13,43,87,0.08)] grid">
                                            <Link
                                                to="/login"
                                                onClick={closeMenus}
                                                className="px-2 py-4 text-sm font-extrabold text-[var(--brand-navy)] border-b border-[rgba(13,43,87,0.06)]"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={closeMenus}
                                                className="px-2 py-5 text-sm font-extrabold text-[var(--brand-gold)]"
                                            >
                                                Register
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </MotionDiv>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
