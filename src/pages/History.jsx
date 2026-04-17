import { useState, useEffect } from 'react';
import api, { asArray } from '../utils/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const cardStyle = {
    background: 'rgba(6,15,35,0.82)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(14,165,233,0.14)',
    borderRadius: '1.25rem',
};

export default function History() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions');
            setTransactions(asArray(response.data));
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const getStatusBadge = (t) => {
        if (t.is_scanned) return (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                style={{ background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', color: '#94a3b8' }}>
                Sudah Terpakai
            </span>
        );
        switch (t.payment_status) {
            case 'success': return (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                    ✓ Sukses
                </span>
            );
            case 'pending': return (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                    ⏳ Pending
                </span>
            );
            case 'failed': return (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                    ✕ Gagal
                </span>
            );
            default: return (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                    style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', color: '#94a3b8' }}>
                    {t.payment_status}
                </span>
            );
        }
    };

    const handlePayNow = (snapToken) => {
        if (snapToken) {
            window.snap?.pay(snapToken, {
                onSuccess: () => fetchTransactions(),
                onPending: () => fetchTransactions(),
                onError: () => alert('Payment failed!'),
                onClose: () => {},
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: '#020817' }}>
                <Navbar />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"
                            style={{ boxShadow: '0 0 15px rgba(14,165,233,0.5)' }} />
                        <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin"
                            style={{ animationDirection: 'reverse' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden font-sans" style={{ background: '#020817' }}>
            {/* BG effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-15 animate-orb"
                    style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.4) 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translateY(-40%)' }} />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'orb 18s ease-in-out infinite reverse' }} />
                <div className="absolute inset-0 cyber-grid opacity-25" />
            </div>

            <Navbar />

            <div className="pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1 h-8 rounded-full"
                                style={{ background: 'linear-gradient(180deg, #00d4ff, #a855f7)' }} />
                            <h1 className="text-4xl font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                                TIKET SAYA
                            </h1>
                        </div>
                        <p className="text-slate-500 ml-4 font-mono text-sm tracking-wider">
                            &gt; {transactions.length} transaksi ditemukan
                        </p>
                    </div>
                    <button
                        onClick={fetchTransactions}
                        className="cyber-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                        style={{
                            background: 'rgba(14,165,233,0.08)',
                            border: '1px solid rgba(14,165,233,0.25)',
                            color: '#38bdf8',
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Empty state */}
                {transactions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 corner-accent"
                        style={cardStyle}
                    >
                        <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
                            style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
                            <svg className="h-10 w-10" style={{ color: '#0ea5e9' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Tidak ada tiket</h3>
                        <p className="text-slate-500 max-w-sm mx-auto text-sm">Kamu belum membeli tiket apapun. Temukan event seru dan amankan tempat sekarang!</p>
                        <a href="/"
                            className="cyber-btn mt-8 inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black text-black"
                            style={{ background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
                            Browse Events →
                        </a>
                    </motion.div>
                ) : (
                    <div className="space-y-5">
                        {transactions.map((t, index) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.07, type: 'spring', stiffness: 200 }}
                                className="corner-accent relative overflow-hidden"
                                style={{
                                    ...cardStyle,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                    transition: 'all 0.3s ease',
                                }}
                                whileHover={{
                                    borderColor: 'rgba(14,165,233,0.3)',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(14,165,233,0.07)',
                                    y: -3,
                                }}
                            >
                                {/* Top accent line */}
                                <div className="absolute top-0 left-0 right-0 h-px"
                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent)' }} />

                                {/* USED stamp */}
                                {t.is_scanned && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                        <div className="rotate-[-12deg] text-4xl font-black tracking-widest opacity-10 text-slate-400"
                                            style={{ border: '3px solid rgba(148,163,184,0.2)', padding: '4px 20px', borderRadius: '8px' }}>
                                            USED
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6">
                                    {/* Left: Info */}
                                    <div className="flex-1 min-w-0">
                                        {/* Meta row */}
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className="text-xs font-black uppercase tracking-widest font-mono"
                                                style={{ color: 'rgba(14,165,233,0.6)' }}>
                                                #TRX-{t.id}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-slate-500 text-xs font-medium">
                                                {new Date(t.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                            </span>
                                            {getStatusBadge(t)}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-black text-white leading-tight mb-3 truncate">
                                            {t.ticket?.title}
                                        </h3>

                                        {/* Tags */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
                                                style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.18)', color: '#38bdf8' }}>
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                </svg>
                                                {t.quantity} Tiket
                                            </span>
                                            <span className="text-lg font-black text-white">
                                                Rp {Number(t.total_price).toLocaleString('id-ID')}
                                            </span>
                                            {t.voucher_code && (
                                                <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide"
                                                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                                                    🏷 {t.voucher_code}
                                                </span>
                                            )}
                                            {t.payment_method_code && (
                                                <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest font-mono"
                                                    style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.15)', color: '#64748b' }}>
                                                    {t.payment_method_code}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-col items-center gap-3 shrink-0 md:pl-8 md:border-l"
                                        style={{ borderColor: 'rgba(14,165,233,0.1)' }}>

                                        {/* Pending → Pay Now */}
                                        {t.payment_status === 'pending' && (
                                            <button
                                                onClick={() => handlePayNow(t.snap_token)}
                                                className="cyber-btn w-full md:w-40 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black text-black"
                                                style={{
                                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                                    boxShadow: '0 0 15px rgba(245,158,11,0.35)',
                                                }}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Bayar Sekarang
                                            </button>
                                        )}

                                        {/* Success → QR + buttons */}
                                        {t.payment_status === 'success' && (
                                            <div className="flex flex-col items-center gap-3 w-full md:w-40">
                                                {/* QR Code */}
                                                <div className="p-2 rounded-xl" style={{ background: '#fff' }}>
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ticket-${t.id}-${t.user_id}-${t.ticket_id}`}
                                                        alt="Ticket QR"
                                                        className="w-[90px] h-[90px] rounded-lg block"
                                                    />
                                                </div>

                                                <button
                                                    onClick={() => window.open(`/print/${t.id}`, '_blank')}
                                                    className="cyber-btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black"
                                                    style={{
                                                        background: 'rgba(14,165,233,0.08)',
                                                        border: '1px solid rgba(14,165,233,0.25)',
                                                        color: '#38bdf8',
                                                    }}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    E-Ticket
                                                </button>

                                                <button
                                                    onClick={() => window.open(`/receipt/${t.id}`, '_blank')}
                                                    className="cyber-btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black"
                                                    style={{
                                                        background: 'rgba(168,85,247,0.08)',
                                                        border: '1px solid rgba(168,85,247,0.2)',
                                                        color: '#c084fc',
                                                    }}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Struk
                                                </button>
                                            </div>
                                        )}

                                        {/* Failed */}
                                        {t.payment_status === 'failed' && (
                                            <div className="w-full md:w-40 py-3 text-center text-xs font-black uppercase tracking-widest rounded-xl"
                                                style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}>
                                                Dibatalkan
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom accent */}
                                <div className="absolute bottom-0 left-0 right-0 h-px"
                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent)' }} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
