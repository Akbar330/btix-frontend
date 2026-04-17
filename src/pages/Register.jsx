import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(168,85,247,0.1) 0%, #020817 55%)' }}>

            {/* Animated background orbs */}
            <div className="absolute -top-20 right-0 w-96 h-96 rounded-full pointer-events-none animate-orb"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'orb 18s ease-in-out infinite' }} />

            {/* Grid overlay */}
            <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link to="/" className="flex justify-center mb-8 group">
                    <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-black font-black text-2xl
                        bg-gradient-to-br from-cyan-400 to-sky-500
                        shadow-[0_0_25px_rgba(14,165,233,0.5)]
                        group-hover:shadow-[0_0_40px_rgba(14,165,233,0.7)]
                        group-hover:scale-105 transition-all duration-300">
                        B
                        <div className="absolute inset-0 rounded-2xl border border-cyan-300/30" />
                    </div>
                </Link>
                <h2 className="mt-2 text-center text-4xl font-black tracking-tight text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                    CREATE ACCOUNT
                </h2>
                <p className="mt-3 text-center text-sm text-slate-400 font-mono tracking-wider">
                    &gt; Join BTIX.ID — discover amazing events
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="corner-accent relative"
                    style={{
                        background: 'rgba(6,15,35,0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(168,85,247,0.18)',
                        borderRadius: '1.25rem',
                        padding: '2.5rem',
                        boxShadow: '0 0 40px rgba(168,85,247,0.05), inset 0 0 40px rgba(168,85,247,0.02)',
                    }}
                >
                    {/* Inner top accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                                style={{
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    color: '#f87171',
                                }}
                            >
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {[
                            { id: 'name', label: 'Full Name', type: 'text', value: name, onChange: setName, placeholder: 'John Doe', icon: 'user' },
                            { id: 'email', label: 'Email Address', type: 'email', value: email, onChange: setEmail, placeholder: 'user@domain.com', icon: 'mail' },
                            { id: 'password', label: 'Password', type: 'password', value: password, onChange: setPassword, placeholder: '••••••••', icon: 'lock', minLength: 8 },
                        ].map(({ id, label, type, value, onChange, placeholder, icon, minLength }) => (
                            <div key={id}>
                                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                                    {label}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                        {icon === 'user' && (
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                        {icon === 'mail' && (
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                        {icon === 'lock' && (
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        )}
                                    </div>
                                    <input
                                        id={id}
                                        type={type}
                                        required
                                        value={value}
                                        onChange={(e) => onChange(e.target.value)}
                                        className="cyber-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                                        placeholder={placeholder}
                                        minLength={minLength}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="cyber-btn w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-black
                                    bg-gradient-to-r from-cyan-400 to-sky-500
                                    shadow-[0_0_20px_rgba(14,165,233,0.4)]
                                    hover:shadow-[0_0_30px_rgba(14,165,233,0.6)]
                                    disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ letterSpacing: '0.1em', fontFamily: 'Orbitron, monospace' }}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        CREATE ACCOUNT
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-700/50" />
                        <span className="text-xs text-slate-600 font-mono tracking-widest">OR</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-700/50" />
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{'  '}
                            <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                                style={{ textShadow: '0 0 8px rgba(14,165,233,0.5)' }}>
                                Log in instead →
                            </Link>
                        </p>
                    </div>

                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                </motion.div>

                <p className="mt-6 text-center text-xs text-slate-600 font-mono tracking-widest">
                    BTIX.ID // SECURE_REGISTER_v2.1
                </p>
            </div>
        </div>
    );
}
