import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { asObject } from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const membershipRates = {
    basic: 0,
    regular: 0.15,
    premium: 0.3,
};

export default function Checkout() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherPreview, setVoucherPreview] = useState(null);
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await api.get(`/tickets/${id}`);
                setTicket(asObject(response.data, ['ticket', 'event']));
            } catch (error) {
                console.error('Failed to fetch ticket', error);
            } finally {
                setLoading(false);
            }
        };

        const loadPublicConfig = async () => {
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

        fetchTicket();
        loadPublicConfig().catch((error) => console.error('Failed to load public config', error));
    }, [id]);

    useEffect(() => {
        setVoucherPreview(null);
    }, [quantity]);

    const pricing = useMemo(() => {
        const subtotal = Number(ticket?.price || 0) * quantity;
        const membershipDiscount = subtotal * (membershipRates[user?.membership] || 0);
        const voucherDiscount = Number(voucherPreview?.discount_amount || 0);
        const total = Math.max(0, subtotal - membershipDiscount - voucherDiscount);

        return { subtotal, membershipDiscount, voucherDiscount, total };
    }, [ticket, quantity, user?.membership, voucherPreview]);

    const handlePreviewVoucher = async () => {
        if (!voucherCode.trim()) {
            setVoucherPreview(null);
            return;
        }

        setVoucherLoading(true);
        try {
            const response = await api.post('/vouchers/preview', {
                code: voucherCode.trim(),
                subtotal: pricing.subtotal - pricing.membershipDiscount,
            });

            setVoucherPreview(response.data);
        } catch (error) {
            setVoucherPreview(null);
            alert(error.response?.data?.message || 'Voucher tidak valid');
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!selectedMethod) {
            alert('Pilih metode pembayaran terlebih dahulu.');
            return;
        }

        setProcessing(true);
        try {
            const response = await api.post('/checkout', {
                ticket_id: ticket.id,
                quantity,
                payment_method: selectedMethod,
                voucher_code: voucherPreview?.voucher?.code || undefined,
            });

            const transaction = response.data;

            if (transaction.snap_token) {
                window.snap.pay(transaction.snap_token, {
                    onSuccess: async function () {
                        try {
                            await api.post(`/transactions/${transaction.id}/success`);
                        } catch (error) {
                            console.error(error);
                        }
                        navigate(`/receipt/${transaction.id}`);
                    },
                    onPending: function () {
                        navigate('/history');
                    },
                    onError: function () {
                        alert('Payment failed!');
                        navigate('/history');
                    },
                    onClose: async function () {
                        try {
                            await api.post(`/transactions/${transaction.id}/cancel`);
                            alert('Kamu menutup popup pembayaran. Kuota tiket sudah dikembalikan.');
                        } catch (error) {
                            console.error(error);
                        }
                        navigate('/history');
                    },
                });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Checkout failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 relative overflow-hidden">
                <Navbar />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-t-4 border-primary-500 animate-spin" />
                        <div className="absolute inset-2 rounded-full border-r-4 border-indigo-400 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Navbar />
                <h2 className="text-2xl font-display font-black text-slate-900">Ticket not found</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-[50%] h-[500px] bg-primary-200/40 rounded-full filter blur-[120px] opacity-70 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[600px] bg-sky-200/30 rounded-full filter blur-[100px] opacity-60 pointer-events-none" />

            <Navbar />

            <div className="pt-32 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-[1fr,0.92fr] gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/75 backdrop-blur-2xl border border-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
                    >
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-600">Checkout</p>
                        <h1 className="mt-4 text-4xl font-display font-black text-slate-900 tracking-tight">Selesaikan pesananmu</h1>

                        <div className="mt-8 rounded-[2rem] bg-slate-50 border border-slate-100 p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white flex flex-col items-center justify-center shadow-lg">
                                    <span className="text-2xl font-black">{new Date(ticket.event_date).getDate()}</span>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                                        {new Date(ticket.event_date).toLocaleString('default', { month: 'short' })}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-2xl font-display font-black text-slate-900">{ticket.title}</h2>
                                    <p className="text-sm text-slate-500 mt-1">{ticket.venue || 'Venue TBA'}{ticket.city ? `, ${ticket.city}` : ''}</p>
                                    <p className="text-sm font-bold text-primary-600 mt-2">
                                        {new Date(ticket.event_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-6">
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-black text-slate-800">Jumlah tiket</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-[0.2em]">Sisa {ticket.quota}</span>
                                </div>
                                <div className="inline-flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                                    <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="w-11 h-11 rounded-full text-lg font-black text-slate-600 hover:bg-slate-50">-</button>
                                    <span className="w-14 text-center text-xl font-black text-slate-900">{quantity}</span>
                                    <button onClick={() => setQuantity((value) => Math.min(ticket.quota, value + 1))} className="w-11 h-11 rounded-full text-lg font-black text-slate-600 hover:bg-slate-50">+</button>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-black text-slate-800">Voucher</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-[0.2em]">Opsional</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                        placeholder="Masukkan kode voucher"
                                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePreviewVoucher}
                                        disabled={voucherLoading}
                                        className="rounded-2xl bg-blue-600 text-white px-5 py-3 text-sm font-black hover:bg-blue-700 disabled:opacity-60"
                                    >
                                        {voucherLoading ? 'Checking...' : 'Apply'}
                                    </button>
                                </div>
                                {voucherPreview?.voucher && (
                                    <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                                        <p className="text-sm font-black text-emerald-700">{voucherPreview.voucher.code}</p>
                                        <p className="text-sm text-emerald-700 mt-1">{voucherPreview.voucher.description}</p>
                                    </div>
                                )}
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-black text-slate-800">Metode pembayaran</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-[0.2em]">{paymentMethods.length} aktif</span>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {paymentMethods.map((method) => {
                                        const active = selectedMethod === method.code;
                                        return (
                                            <button
                                                key={method.code}
                                                type="button"
                                                onClick={() => setSelectedMethod(method.code)}
                                                className={`rounded-2xl border px-4 py-4 text-left transition-all ${active ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100' : 'border-slate-200 bg-white hover:border-primary-300'}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-black text-slate-900">{method.name}</p>
                                                        <p className="text-sm text-slate-500 mt-1">{method.description}</p>
                                                    </div>
                                                    <span className={`mt-1 w-5 h-5 rounded-full border-2 ${active ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {paymentMethods.length === 0 && (
                                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                                        Belum ada metode pembayaran aktif.
                                    </div>
                                )}
                            </section>
                        </div>
                    </motion.div>

                    <motion.aside
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-10 shadow-sm h-fit"
                    >
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Ringkasan</p>
                        <div className="mt-8 space-y-4 text-sm">
                            <Row label={`Subtotal (${quantity} tiket)`} value={pricing.subtotal} />
                            {pricing.membershipDiscount > 0 && (
                                <Row label={`Membership ${user?.membership}`} value={-pricing.membershipDiscount} highlight />
                            )}
                            {pricing.voucherDiscount > 0 && (
                                <Row label={`Voucher ${voucherPreview?.voucher?.code}`} value={-pricing.voucherDiscount} highlight />
                            )}
                            <div className="flex justify-between text-slate-600">
                                <span>Service fee</span>
                                <span className="font-black text-blue-600">Free</span>
                            </div>
                            <div className="border-t border-slate-200 pt-5 flex items-end justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Total bayar</p>
                                    <p className="mt-2 text-4xl font-display font-black text-slate-900">Rp {Math.floor(pricing.total).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={processing || paymentMethods.length === 0}
                            className="w-full mt-8 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-4 text-lg font-black text-white shadow-[0_15px_35px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Memproses pembayaran...' : 'Bayar Sekarang'}
                        </button>

                        <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                            Voucher, membership discount, dan metode pembayaran aktif akan divalidasi ulang di backend sebelum Snap Midtrans dibuka.
                        </p>
                    </motion.aside>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value, highlight = false }) {
    const isNegative = Number(value) < 0;

    return (
        <div className={`flex justify-between ${highlight ? 'text-emerald-700' : 'text-slate-600'}`}>
            <span>{label}</span>
            <span className="font-black">
                {isNegative ? '- ' : ''}Rp {Math.floor(Math.abs(Number(value))).toLocaleString('id-ID')}
            </span>
        </div>
    );
}
