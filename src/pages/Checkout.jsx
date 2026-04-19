import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { asObject } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import {
    EmptyState,
    InfoTile,
    LoadingScreen,
    PageHero,
    Pill,
    PrimaryButton,
    SectionIntro,
    FlatCard,
} from '../components/TixUI';
import { showError, showInfo, showToast } from '../utils/swal';

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
        const voucherDiscount = Number(voucherPreview?.discount_amount || 0);
        const total = Math.max(0, subtotal - voucherDiscount);
        return { subtotal, voucherDiscount, total };
    }, [ticket, quantity, voucherPreview]);

    const handlePreviewVoucher = async () => {
        if (!voucherCode.trim()) {
            setVoucherPreview(null);
            return;
        }

        setVoucherLoading(true);
        try {
            const response = await api.post('/vouchers/preview', {
                code: voucherCode.trim(),
                subtotal: pricing.subtotal,
            });
            setVoucherPreview(response.data);
        } catch (error) {
            setVoucherPreview(null);
            showError('Invalid Voucher', error.response?.data?.message || 'Voucher tidak valid');
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!selectedMethod) {
            showInfo('Payment Method', 'Pilih metode pembayaran terlebih dahulu.');
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
                    onSuccess: async () => {
                        try {
                            await api.post(`/transactions/${transaction.id}/success`);
                        } catch (error) {
                            console.error(error);
                        }
                        navigate(`/receipt/${transaction.id}`);
                    },
                    onPending: () => navigate('/history'),
                    onError: () => {
                        showError('Payment Failed', 'Pembayaran gagal atau dibatalkan.');
                        navigate('/history');
                    },
                    onClose: async () => {
                        try {
                            await api.post(`/transactions/${transaction.id}/cancel`);
                            showInfo('Order Cancelled', 'Kamu menutup popup pembayaran. Kuota tiket sudah dikembalikan.');
                        } catch (error) {
                            console.error(error);
                        }
                        navigate('/history');
                    },
                });
            }
        } catch (error) {
            showError('Checkout Error', error.response?.data?.message || 'Checkout failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <LoadingScreen label="Menyiapkan checkout..." />;

    if (!ticket) {
        return (
            <div className="page-shell min-h-screen">
                
                <div className="tix-container pt-36 pb-20">
                    <EmptyState
                        eyebrow="Checkout"
                        title="Tiket Tidak Ditemukan"
                        description="Event yang ingin kamu beli tidak tersedia lagi. Silakan kembali ke katalog utama."
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell min-h-screen">
            

            <PageHero
                eyebrow="Checkout"
                title="Selesaikan pesanan Anda"
                description="Layout checkout saya samakan ke gaya terang dan premium agar terasa satu keluarga dengan homepage dan halaman tiket."
            />

            <main className="tix-container pb-20">
                <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.92fr]">
                    <FlatCard className="p-6 sm:p-8">
                        <SectionIntro
                            eyebrow="Order Detail"
                            title={ticket.title}
                            description={`${ticket.venue || 'Venue TBA'}${ticket.city ? `, ${ticket.city}` : ''}`}
                        />

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <InfoTile
                                label="Tanggal"
                                value={new Date(ticket.event_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                                subtle
                            />
                            <InfoTile label="Harga Dasar" value={`Rp ${Number(ticket.price).toLocaleString('id-ID')}`} />
                        </div>

                        <div className="mt-8 grid gap-8">
                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--brand-navy)]">
                                        Jumlah Tiket
                                    </span>
                                    <Pill tone="gray">Sisa {ticket.quota}</Pill>
                                </div>
                                <div className="inline-flex items-center rounded-2xl border border-[rgba(13,43,87,0.10)] bg-[rgba(13,43,87,0.03)] p-1">
                                    <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-11 w-11 rounded-full text-lg font-extrabold text-[var(--brand-navy)]">
                                        -
                                    </button>
                                    <span className="w-16 text-center text-xl font-extrabold text-[var(--brand-navy)]">{quantity}</span>
                                    <button type="button" onClick={() => setQuantity((value) => Math.min(ticket.quota, value + 1))} className="h-11 w-11 rounded-full text-lg font-extrabold text-[var(--brand-navy)]">
                                        +
                                    </button>
                                </div>
                            </section>

                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--brand-navy)]">
                                        Voucher
                                    </span>
                                    <Pill tone="gold">Opsional</Pill>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <input
                                        type="text"
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                        placeholder="Masukkan kode voucher"
                                        className="cyber-input flex-1 rounded-2xl px-4 py-3 text-sm"
                                    />
                                    <PrimaryButton type="button" onClick={handlePreviewVoucher} disabled={voucherLoading}>
                                        {voucherLoading ? 'Checking...' : 'Apply'}
                                    </PrimaryButton>
                                </div>
                                {voucherPreview?.voucher && (
                                    <div className="mt-3 rounded-2xl bg-[rgba(26,140,86,0.08)] px-4 py-4 text-sm text-[#1c7a50]">
                                        <p className="font-extrabold uppercase tracking-[0.14em]">{voucherPreview.voucher.code}</p>
                                        <p className="mt-1">{voucherPreview.voucher.description}</p>
                                    </div>
                                )}
                            </section>

                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--brand-navy)]">
                                        Metode Pembayaran
                                    </span>
                                    <Pill tone="gray">{paymentMethods.length} aktif</Pill>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {paymentMethods.map((method) => {
                                        const active = selectedMethod === method.code;
                                        return (
                                            <button
                                                key={method.code}
                                                type="button"
                                                onClick={() => setSelectedMethod(method.code)}
                                                className={`rounded-2xl border px-4 py-4 text-left transition ${active ? 'border-[rgba(216,166,70,0.4)] bg-[rgba(216,166,70,0.12)]' : 'border-[rgba(13,43,87,0.10)] bg-white'}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-extrabold text-[var(--brand-navy)]">{method.name}</p>
                                                        <p className="mt-1 text-sm text-[var(--text-muted)]">{method.description}</p>
                                                    </div>
                                                    <span className={`mt-1 h-5 w-5 rounded-full border-2 ${active ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)]' : 'border-[rgba(13,43,87,0.22)]'}`} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                    </FlatCard>

                    <FlatCard className="h-fit p-6 sm:p-8">
                        <SectionIntro
                            eyebrow="Summary"
                            title="Ringkasan"
                            description="Semua diskon voucher tetap divalidasi ulang di backend sebelum pembayaran dibuka."
                        />

                        <div className="mt-8 space-y-4 text-sm">
                            <SummaryRow label={`Subtotal (${quantity} tiket)`} value={pricing.subtotal} />
                            {pricing.voucherDiscount > 0 && (
                                <SummaryRow label={`Voucher ${voucherPreview?.voucher?.code}`} value={-pricing.voucherDiscount} highlight />
                            )}
                            <SummaryRow label="Service Fee" value={0} textValue="Free" />
                            <div className="border-t border-[rgba(13,43,87,0.10)] pt-5">
                                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                    Total Bayar
                                </p>
                                <p className="mt-2 font-sans text-5xl font-extrabold uppercase text-[var(--brand-navy)]">
                                    Rp {Math.floor(pricing.total).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <PrimaryButton type="button" onClick={handleCheckout} disabled={processing || paymentMethods.length === 0} className="w-full">
                                {processing ? 'Memproses Pembayaran...' : 'Bayar Sekarang'}
                            </PrimaryButton>
                        </div>
                    </FlatCard>
                </section>
            </main>
        </div>
    );
}

function SummaryRow({ label, value, highlight = false, textValue }) {
    const isNegative = Number(value) < 0;
    return (
        <div className={`flex items-center justify-between ${highlight ? 'text-[#1c7a50]' : 'text-[var(--text-muted)]'}`}>
            <span>{label}</span>
            <span className="font-extrabold text-[var(--brand-navy)]">
                {textValue || `${isNegative ? '- ' : ''}Rp ${Math.floor(Math.abs(Number(value))).toLocaleString('id-ID')}`}
            </span>
        </div>
    );
}
