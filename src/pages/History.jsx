import { useState, useEffect } from 'react';
import api, { asArray } from '../utils/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

export default function History() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions');
            setTransactions(asArray(response.data));
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const getStatusBadge = (t) => {
        if (t.is_scanned) return <span className="px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">Sudah Terpakai</span>;

        switch (t.payment_status) {
            case 'success':
                return <span className="px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">Success (Ready)</span>;
            case 'pending':
                return <span className="px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider animate-pulse backdrop-blur-sm shadow-sm">Pending</span>;
            case 'failed':
                return <span className="px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">Failed / Cancelled</span>;
            default:
                return <span className="px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">{t.payment_status}</span>;
        }
    };

    const handlePayNow = (snapToken) => {
        if (snapToken) {
            window.snap.pay(snapToken, {
                onSuccess: function (result) {
                    fetchTransactions();
                },
                onPending: function (result) {
                    fetchTransactions();
                },
                onError: function (result) {
                    alert('Payment failed!');
                },
                onClose: function () {
                    alert('You closed the popup without finishing the payment');
                }
            });
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 relative overflow-hidden">
                <Navbar />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-t-4 border-primary-500 animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-r-4 border-indigo-400 animate-spin animation-delay-200"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[10%] -left-[10%] w-[50%] h-[500px] bg-sky-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob pointer-events-none z-0"></div>
            <div className="absolute bottom-[20%] -right-[10%] w-[60%] h-[600px] bg-primary-300/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-2000 pointer-events-none z-0"></div>

            <Navbar />

            <div className="pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">My Tickets</h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage and view your purchased tickets</p>
                    </div>
                    <button
                        onClick={fetchTransactions}
                        className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-700 bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white hover:border-primary-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {transactions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white">
                            <svg className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No tickets yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">You haven't purchased any tickets. Discover amazing experiences and secure your spot today!</p>
                        <a href="/#events" className="mt-8 inline-block px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors">
                            Browse Events
                        </a>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {transactions.map((t, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                key={t.id}
                                className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-1 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.1)] hover:-translate-y-1 transition-all duration-300"
                            >
                                {t.is_scanned && (
                                    <div className="absolute inset-0 z-20 bg-slate-50/10 backdrop-blur-[1px] rounded-3xl flex items-center justify-center pointer-events-none overflow-hidden">
                                        <div className="rotate-[-10deg] border-4 border-slate-400 px-8 py-2 rounded-2xl text-slate-400 font-display font-black text-4xl uppercase opacity-20 tracking-widest scale-150">
                                            USED
                                        </div>
                                    </div>
                                )}
                                <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                    <div className="flex-1 w-full text-center md:text-left">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Order #{t.id}</span>
                                            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                            <span className="text-slate-500 text-sm font-medium">{new Date(t.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                                            <div className="hidden sm:block ml-2">{getStatusBadge(t)}</div>
                                        </div>
                                        <div className="sm:hidden mb-3 flex justify-center">{getStatusBadge(t)}</div>

                                        <h3 className="text-2xl font-display font-extrabold text-slate-900 leading-tight mb-2">{t.ticket?.title}</h3>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-slate-600 font-medium">
                                            <span className="flex items-center text-primary-600 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
                                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                </svg>
                                                {t.quantity} Ticket(s)
                                            </span>
                                            <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
                                                Rp {Number(t.total_price).toLocaleString('id-ID')}
                                            </span>
                                            {t.voucher_code && (
                                                <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                                    Voucher {t.voucher_code}
                                                </span>
                                            )}
                                            {t.payment_method_code && (
                                                <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                                    {t.payment_method_code}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 md:pl-8 md:border-l border-slate-200/50">
                                        {t.payment_status === 'pending' && (
                                            <button
                                                onClick={() => handlePayNow(t.snap_token)}
                                                className="w-full md:w-40 justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                        {t.payment_status === 'success' && (
                                            <div className="flex flex-col items-center gap-3 w-full md:w-40">
                                                <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.05)] mx-auto">
                                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ticket-${t.id}-${t.user_id}-${t.ticket_id}`} alt="Ticket QR Code" className="w-[100px] h-[100px] rounded-lg" />
                                                </div>
                                                <button
                                                    onClick={() => window.open(`/print/${t.id}`, '_blank')}
                                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
                                                >
                                                    <svg className="-ml-1 mr-2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Save E-Ticket
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/receipt/${t.id}`, '_blank')}
                                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-primary-100 shadow-sm text-sm font-bold rounded-xl text-primary-600 bg-primary-50/50 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                                                >
                                                    <svg className="-ml-1 mr-2 h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Lihat Struk
                                                </button>
                                            </div>
                                        )}
                                        {t.payment_status === 'failed' && (
                                            <div className="w-full md:w-40 py-3 text-center text-sm font-bold text-slate-400 bg-slate-100/50 rounded-xl border border-slate-200 border-dashed">
                                                Order Cancelled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
