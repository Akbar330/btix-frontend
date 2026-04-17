import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const PremiumBadge = ({ label }) => (
    <span className="badge-premium-gold">
        <svg className="w-3 h-3 relative z-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span className="relative z-10">{label}</span>
    </span>
);

export default function Membership() {
    const { user, refreshUser } = useAuth();
    const [plans, setPlans] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [loading, setLoading] = useState(null);
    const [message, setMessage] = useState('');
    const [plansLoading, setPlansLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setPlansLoading(true);
            try {
                const [configRes, plansRes] = await Promise.all([
                    api.get('/public-config'),
                    api.get('/admin/membership-plans'),
                ]);

                const methods = configRes.data?.payment_methods || [];
                setPaymentMethods(methods);
                setSelectedMethod((current) => current || methods[0]?.code || '');

                setPlans(plansRes.data || []);

                if (document.getElementById('midtrans-script')) return;

                const script = document.createElement('script');
                script.id = 'midtrans-script';
                script.src = configRes.data?.midtrans?.snap_url || 'https://app.sandbox.midtrans.com/snap/snap.js';
                script.setAttribute('data-client-key', configRes.data?.midtrans?.client_key || 'SB-Mid-client-000000000');
                document.head.appendChild(script);
            } catch (error) {
                console.error('Failed to load data', error);
            } finally {
                setPlansLoading(false);
            }
        };

        loadData();
    }, []);

    const handleUpgrade = async (plan) => {
        if (user?.membership_plan_id === plan.id) return;
        if (!selectedMethod && plan.price > 0) {
            setMessage({ type: 'error', text: 'Pilih metode pembayaran terlebih dahulu.' });
            return;
        }

        setLoading(plan.id);
        setMessage('');

        try {
            if (plan.price === 0) {
                const confirmRes = await api.post('/membership/confirm', { membership_plan_id: plan.id });
                setMessage({ type: 'success', text: confirmRes.data.message });
                await refreshUser();
                setLoading(null);
                return;
            }

            const response = await api.post('/membership/upgrade', {
                membership_plan_id: plan.id,
                payment_method: selectedMethod,
            });

            if (response.data.free_plan) {
                const confirmRes = await api.post('/membership/confirm', { membership_plan_id: plan.id });
                setMessage({ type: 'success', text: confirmRes.data.message });
                await refreshUser();
                setLoading(null);
                return;
            }

            const { snap_token } = response.data;

            if (window.snap) {
                window.snap.pay(snap_token, {
                    onSuccess: async function () {
                        try {
                            const confirmRes = await api.post('/membership/confirm', { membership_plan_id: plan.id });
                            setMessage({ type: 'success', text: confirmRes.data.message });
                            await refreshUser();
                        } catch (e) {
                            setMessage({ type: 'error', text: 'Gagal mengaktifkan membership. Hubungi support.' });
                        }
                    },
                    onPending: function () {
                        setMessage({ type: 'info', text: 'Menunggu pembayaran membership Anda.' });
                    },
                    onError: function () {
                        setMessage({ type: 'error', text: 'Pembayaran gagal. Silakan coba lagi.' });
                    },
                    onClose: function () {
                        setMessage({ type: 'info', text: 'Pembayaran dibatalkan.' });
                    }
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memproses upgrade.' });
        } finally {
            setLoading(null);
        }
    };

    // Tier configs
    const tierConfig = [
        {
            gradient: 'from-slate-700 to-slate-600',
            glowColor: 'rgba(148,163,184,0.2)',
            borderColor: 'rgba(148,163,184,0.15)',
            accentColor: '#94a3b8',
            label: 'BASIC',
        },
        {
            gradient: 'from-cyan-500 to-sky-600',
            glowColor: 'rgba(14,165,233,0.3)',
            borderColor: 'rgba(14,165,233,0.4)',
            accentColor: '#0ea5e9',
            label: 'POPULAR',
            featured: true,
        },
        {
            gradient: 'from-amber-500 to-yellow-400',
            glowColor: 'rgba(255,215,0,0.3)',
            borderColor: 'rgba(255,215,0,0.35)',
            accentColor: '#ffd700',
            label: 'PREMIUM',
        },
    ];

    return (
        <div className="min-h-screen" style={{ background: '#020817' }}>
            <Navbar />

            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[600px] opacity-20"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.4) 0%, transparent 70%)' }} />
                <div className="absolute top-40 -left-20 w-72 h-72 rounded-full animate-orb"
                    style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                <div className="absolute bottom-40 -right-20 w-80 h-80 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'orb 18s ease-in-out infinite reverse' }} />
                <div className="absolute inset-0 cyber-grid opacity-25" />
            </div>

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* ===== HEADER ===== */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full text-xs font-black tracking-widest uppercase"
                            style={{
                                background: 'rgba(14,165,233,0.08)',
                                border: '1px solid rgba(14,165,233,0.2)',
                                color: '#0ea5e9',
                                textShadow: '0 0 10px rgba(14,165,233,0.5)',
                            }}>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            Membership Plans
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                            Pilih Membership, <br />
                            <span className="text-gradient-gold">Hemat Lebih Banyak</span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Nikmati diskon eksklusif dan berbagai keuntungan tambahan untuk setiap pembelian tiket event favoritmu.
                        </p>
                    </motion.div>
                </div>

                {/* ===== MESSAGE ALERT ===== */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`max-w-md mx-auto mb-12 p-4 rounded-xl border flex items-center gap-3 ${
                            message.type === 'success'
                                ? 'text-emerald-400'
                                : message.type === 'info'
                                    ? 'text-cyan-400'
                                    : 'text-rose-400'
                        }`}
                        style={{
                            background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : message.type === 'info' ? 'rgba(14,165,233,0.08)' : 'rgba(239,68,68,0.08)',
                            borderColor: message.type === 'success' ? 'rgba(16,185,129,0.25)' : message.type === 'info' ? 'rgba(14,165,233,0.25)' : 'rgba(239,68,68,0.25)',
                        }}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            message.type === 'success' ? 'bg-emerald-500/15' : message.type === 'info' ? 'bg-cyan-500/15' : 'bg-rose-500/15'
                        }`}>
                            {message.type === 'success' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                        </div>
                        <p className="font-bold text-sm">{message.text}</p>
                    </motion.div>
                )}

                {/* ===== PAYMENT METHODS ===== */}
                <div className="max-w-3xl mx-auto mb-12">
                    <div className="corner-accent relative p-6 sm:p-8 rounded-2xl"
                        style={{
                            background: 'rgba(6,15,35,0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(14,165,233,0.15)',
                        }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-xl font-black text-white">Metode Pembayaran</h2>
                                <p className="text-slate-500 text-sm mt-1">Pilih metode pembayaran aktif untuk upgrade membership.</p>
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">{paymentMethods.length} aktif</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {paymentMethods.map((method) => {
                                const active = selectedMethod === method.code;
                                return (
                                    <button
                                        key={method.code}
                                        type="button"
                                        onClick={() => setSelectedMethod(method.code)}
                                        className={`text-left rounded-xl border px-4 py-4 transition-all duration-200 ${
                                            active
                                                ? 'text-cyan-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                        style={{
                                            background: active ? 'rgba(14,165,233,0.06)' : 'rgba(6,15,35,0.5)',
                                            borderColor: active ? 'rgba(14,165,233,0.3)' : 'rgba(14,165,233,0.08)',
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className={`font-bold ${active ? 'text-cyan-300' : 'text-slate-200'}`}>{method.name}</p>
                                                <p className="text-sm text-slate-500 mt-1">{method.description}</p>
                                            </div>
                                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${active ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                                                {active && <div className="w-2 h-2 rounded-full bg-black" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {paymentMethods.length === 0 && (
                            <div className="mt-4 rounded-xl px-4 py-3 text-sm font-medium text-cyan-400"
                                style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
                                Saat ini belum ada metode pembayaran aktif untuk upgrade membership.
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== PLAN CARDS ===== */}
                {plansLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                            <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin" style={{ animationDirection: 'reverse' }} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => {
                            const isCurrentPlan = user?.membership_plan_id === plan.id;
                            const cfg = tierConfig[idx] || tierConfig[0];
                            const isGold = idx === 2;
                            const isFeatured = idx === 1;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative corner-accent ${isFeatured ? 'md:scale-105 z-20' : 'z-10'}`}
                                    style={{
                                        background: 'rgba(6,15,35,0.85)',
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${cfg.borderColor}`,
                                        borderRadius: '1.5rem',
                                        padding: '2rem',
                                        boxShadow: isFeatured
                                            ? `0 0 40px ${cfg.glowColor}, 0 20px 40px rgba(0,0,0,0.4)`
                                            : `0 0 20px rgba(0,0,0,0.3)`,
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {/* Top glow line */}
                                    <div className="absolute top-0 left-0 right-0 h-px rounded-t-3xl"
                                        style={{ background: `linear-gradient(90deg, transparent, ${cfg.accentColor}, transparent)`, opacity: isFeatured ? 0.7 : 0.3 }} />

                                    {/* Badge label */}
                                    {isFeatured && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black"
                                            style={{
                                                background: `linear-gradient(135deg, ${cfg.accentColor}, #38bdf8)`,
                                                boxShadow: `0 0 15px ${cfg.glowColor}`,
                                            }}>
                                            Most Popular
                                        </div>
                                    )}
                                    {isGold && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <PremiumBadge label="★ PREMIUM" />
                                        </div>
                                    )}

                                    {/* Plan header */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black text-sm font-black"
                                                style={{ background: `linear-gradient(135deg, ${cfg.accentColor}, ${cfg.accentColor}aa)` }}>
                                                {idx === 0 ? '⬡' : idx === 1 ? '⚡' : '♛'}
                                            </div>
                                            <h3 className="text-lg font-black text-white">{plan.display_name}</h3>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-white">
                                                {plan.price > 0 ? `Rp ${Number(plan.price).toLocaleString('id-ID')}` : 'Gratis'}
                                            </span>
                                            {plan.price > 0 && <span className="text-slate-500 text-sm font-medium">/bulan</span>}
                                        </div>
                                        {plan.discount_percentage > 0 && (
                                            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg"
                                                style={{
                                                    background: isGold ? 'rgba(255,215,0,0.1)' : 'rgba(14,165,233,0.1)',
                                                    border: `1px solid ${isGold ? 'rgba(255,215,0,0.25)' : 'rgba(14,165,233,0.2)'}`,
                                                    color: isGold ? '#ffd700' : cfg.accentColor,
                                                }}>
                                                Diskon: {plan.discount_percentage}% off
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-400 mb-6">{plan.description}</p>

                                    {/* Features */}
                                    <div className="space-y-3 mb-8">
                                        {plan.features?.map((feature, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-3 text-slate-300 text-sm">
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ background: `${cfg.accentColor}18`, border: `1px solid ${cfg.accentColor}30` }}>
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke={cfg.accentColor} strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleUpgrade(plan)}
                                        disabled={isCurrentPlan || loading === plan.id || paymentMethods.length === 0}
                                        className={`cyber-btn w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all duration-300 ${
                                            isCurrentPlan
                                                ? 'cursor-default opacity-50'
                                                : ''
                                        }`}
                                        style={isCurrentPlan ? {
                                            background: 'rgba(148,163,184,0.1)',
                                            border: '1px solid rgba(148,163,184,0.1)',
                                            color: '#64748b',
                                        } : {
                                            background: isGold
                                                ? 'linear-gradient(135deg, #b8860b, #ffd700, #ffe566)'
                                                : `linear-gradient(135deg, ${cfg.accentColor}, ${isFeatured ? '#38bdf8' : cfg.accentColor}cc)`,
                                            color: '#000',
                                            boxShadow: `0 0 20px ${cfg.glowColor}`,
                                        }}
                                    >
                                        {loading === plan.id ? (
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            isCurrentPlan ? 'Aktif Saat Ini ✓' : `Pilih ${plan.display_name}`
                                        )}
                                    </button>

                                    {/* Bottom glow line */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px"
                                        style={{ background: `linear-gradient(90deg, transparent, ${cfg.accentColor}50, transparent)` }} />
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* ===== CTA SECTION ===== */}
                <div className="mt-20 relative overflow-hidden rounded-3xl p-10"
                    style={{
                        background: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(168,85,247,0.08) 100%)',
                        border: '1px solid rgba(14,165,233,0.2)',
                        boxShadow: '0 0 60px rgba(14,165,233,0.06)',
                    }}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                    <div className="absolute -top-20 right-0 w-80 h-80 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.5) 0%, transparent 70%)', filter: 'blur(40px)' }} />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-black mb-4 leading-tight text-white">Berlangganan Sekarang dan <span className="text-gradient-cyan">Hemat Uang Jajanmu</span></h2>
                            <p className="text-slate-400 font-medium">Semua membership berlaku selama 30 hari. Kamu bisa membatalkan atau mengubah tier kapan saja melalui pengaturan profil.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center px-6 py-4 rounded-2xl"
                                style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', backdropFilter: 'blur(12px)' }}>
                                <p className="text-2xl font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>50k+</p>
                                <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mt-1">Active Users</p>
                            </div>
                            <div className="text-center px-6 py-4 rounded-2xl"
                                style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)', backdropFilter: 'blur(12px)' }}>
                                <p className="text-2xl font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>100%</p>
                                <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest mt-1">Secure Payment</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
