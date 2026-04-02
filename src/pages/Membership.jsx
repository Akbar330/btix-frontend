import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

export default function Membership() {
    const { user, refreshUser } = useAuth();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [loading, setLoading] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadMidtransScript = async () => {
            const response = await api.get('/public-config');
            const methods = response.data?.payment_methods || [];
            setPaymentMethods(methods);
            setSelectedMethod((current) => current || methods[0]?.code || '');

            if (document.getElementById('midtrans-script')) return;

            const script = document.createElement('script');
            script.id = 'midtrans-script';
            script.src = response.data?.midtrans?.snap_url || 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', response.data?.midtrans?.client_key || 'SB-Mid-client-000000000');
            document.head.appendChild(script);
        };

        loadMidtransScript().catch((error) => {
            console.error('Failed to load Midtrans script', error);
        });
    }, []);

    const tiers = [
        {
            id: 'basic',
            name: 'Basic',
            price: 'Gratis',
            discount: '0%',
            features: [
                'Akses semua event',
                'E-Ticket Digital',
                'Riwayat Transaksi',
            ],
            color: 'from-slate-400 to-slate-500',
            buttonText: 'Current Plan',
        },
        {
            id: 'regular',
            name: 'Regular',
            price: 'Rp 50.000',
            period: '/bulan',
            discount: '15%',
            features: [
                'Diskon 15% semua tiket',
                'Customer Support Priotitas',
                'Badge Regular di Profil',
                'Akses Presale Khusus',
            ],
            color: 'from-indigo-500 to-violet-600',
            buttonText: 'Upgrade ke Regular',
            popular: false,
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 'Rp 100.000',
            period: '/bulan',
            discount: '30%',
            features: [
                'Diskon 30% semua tiket',
                'Bebas Biaya Admin',
                'Badge Premium Gold',
                'Eksklusif Meet & Greet',
                'Refund Instan',
            ],
            color: 'from-amber-400 to-orange-600',
            buttonText: 'Upgrade ke Premium',
            popular: true,
        },
    ];

    const handleUpgrade = async (tierId) => {
        if (user.membership === tierId || tierId === 'basic') return;
        if (!selectedMethod) {
            setMessage({ type: 'error', text: 'Pilih metode pembayaran terlebih dahulu.' });
            return;
        }
        
        setLoading(tierId);
        setMessage('');
        
        try {
            const response = await api.post('/membership/upgrade', {
                membership: tierId,
                payment_method: selectedMethod,
            });
            const { snap_token } = response.data;

            if (window.snap) {
                window.snap.pay(snap_token, {
                    onSuccess: async function (result) {
                        try {
                            const confirmRes = await api.post('/membership/confirm', { membership: tierId });
                            setMessage({ type: 'success', text: confirmRes.data.message });
                            await refreshUser();
                        } catch (e) {
                            setMessage({ type: 'error', text: 'Gagal mengaktifkan membership. Hubungi support.' });
                        }
                    },
                    onPending: function (result) {
                        setMessage({ type: 'info', text: 'Menunggu pembayaran membership Anda.' });
                    },
                    onError: function (result) {
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

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <Navbar />

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-50/50 to-transparent -z-10" />
            <div className="absolute top-40 -left-20 w-80 h-80 bg-primary-200/30 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-40 -right-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-[120px] -z-10 animate-delay-1000" />

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-black tracking-widest text-primary-600 uppercase bg-primary-100 rounded-full">
                            Membership Plans
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-display font-black text-slate-900 mb-6 leading-tight">
                            Pilih Membership, <br />
                            <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Hemat Lebih Banyak</span>
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Nikmati diskon eksklusif dan berbagai keuntungan tambahan untuk setiap pembelian tiket event favoritmu.
                        </p>
                    </motion.div>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`max-w-md mx-auto mb-12 p-4 rounded-2xl border flex items-center gap-3 ${
                            message.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                                : 'bg-red-50 border-red-100 text-red-800'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                            {message.type === 'success' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                        </div>
                        <p className="font-bold text-sm">{message.text}</p>
                    </motion.div>
                )}

                <div className="max-w-3xl mx-auto mb-12">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-xl font-display font-bold text-slate-900">Metode Pembayaran</h2>
                                <p className="text-slate-500 text-sm mt-1">Pilih metode pembayaran aktif yang ingin dipakai untuk upgrade membership.</p>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{paymentMethods.length} aktif</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {paymentMethods.map((method) => {
                                const active = selectedMethod === method.code;
                                return (
                                    <button
                                        key={method.code}
                                        type="button"
                                        onClick={() => setSelectedMethod(method.code)}
                                        className={`text-left rounded-2xl border px-4 py-4 transition-all ${active
                                            ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100'
                                            : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-slate-900">{method.name}</p>
                                                <p className="text-sm text-slate-500 mt-1">{method.description}</p>
                                            </div>
                                            <span className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 ${active ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {paymentMethods.length === 0 && (
                            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                                Saat ini belum ada metode pembayaran aktif untuk upgrade membership.
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier, idx) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 ${
                                tier.popular ? 'ring-2 ring-primary-500 scale-105 md:scale-110 z-20' : 'z-10'
                            }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-black text-slate-800 mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900">{tier.price}</span>
                                    {tier.period && <span className="text-slate-400 text-sm font-medium">{tier.period}</span>}
                                </div>
                                <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r ${tier.color} text-white`}>
                                    Benefit Diskon: {tier.discount}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                {tier.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                        <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                                            <svg className="w-3 h-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade(tier.id)}
                                disabled={user.membership === tier.id || loading || paymentMethods.length === 0}
                                className={`w-full py-4 rounded-2xl text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                                    user.membership === tier.id
                                        ? 'bg-slate-100 text-slate-400 cursor-default'
                                        : tier.popular
                                            ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40'
                                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'
                                }`}
                            >
                                {loading === tier.id ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    user.membership === tier.id ? 'Aktif Saat Ini' : tier.buttonText
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px]" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-black mb-4 leading-tight">Berlangganan Sekarang & Hemat Uang Jajanmu!</h2>
                            <p className="text-slate-300 font-medium">Semua membership berlaku selama 30 hari. Kamu bisa membatalkan atau mengubah tier kapan saja melalui pengaturan profil.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                                <p className="text-2xl font-black text-white">50k+</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Users</p>
                            </div>
                            <div className="text-center px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                                <p className="text-2xl font-black text-white">100%</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure Payment</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
