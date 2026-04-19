import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { asArray } from '../utils/api';
import {
    EmptyState,
    LoadingScreen,
    MotionArticle,
    PageHero,
    Pill,
    PrimaryButton,
    SectionIntro,
    FlatCard,
} from '../components/TixUI';
import { showError } from '../utils/swal';


function getStatusMeta(transaction) {
    if (transaction.is_scanned) return { label: 'Sudah Terpakai', tone: 'gray' };
    if (transaction.payment_status === 'success') return { label: 'Sukses', tone: 'green' };
    if (transaction.payment_status === 'pending') return { label: 'Pending', tone: 'gold' };
    if (transaction.payment_status === 'failed') return { label: 'Gagal', tone: 'red' };
    return { label: transaction.payment_status || 'Unknown', tone: 'gray' };
}

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

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handlePayNow = (snapToken) => {
        if (!snapToken) return;
        window.snap?.pay(snapToken, {
            onSuccess: fetchTransactions,
            onPending: fetchTransactions,
            onError: () => showError('Payment Failed', 'Pembayaran gagal dilakukan.'),
            onClose: () => {},
        });
    };

    if (loading) return <LoadingScreen label="Menyiapkan tiket saya..." />;

    return (
        <div className="page-shell min-h-screen">
            

            <PageHero
                eyebrow="My Tickets"
                title="Semua tiket dan transaksi Anda dalam satu tampilan"
                description="Halaman ini saya rapikan dengan gaya katalog premium agar sejalan dengan referensi TIX ID: terang, rapi, dan fokus pada informasi inti tiket."
                actions={
                    <PrimaryButton type="button" onClick={fetchTransactions}>
                        Refresh Data
                    </PrimaryButton>
                }
            />

            <main className="tix-container pb-20">
                <section className="mt-12">
                    <SectionIntro
                        eyebrow="Transaction History"
                        title="Tiket Saya"
                        description={`${transactions.length} transaksi ditemukan. Tiket yang sudah dibayar akan langsung menampilkan aksi cetak atau buka e-ticket.`}
                    />

                    {transactions.length === 0 ? (
                        <div className="mt-8">
                            <EmptyState
                                eyebrow="No Ticket"
                                title="Belum Ada Tiket"
                                description="Kamu belum memiliki transaksi. Jelajahi event yang sedang tayang lalu lakukan pemesanan agar tiket muncul di sini."
                                action={
                                    <Link to="/" className="tix-pill-button px-7 py-4 text-sm">
                                        Jelajahi Event
                                    </Link>
                                }
                            />
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-5">
                            {transactions.map((transaction, index) => {
                                const status = getStatusMeta(transaction);
                                return (
                                    <MotionArticle
                                        key={transaction.id}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-50px' }}
                                        transition={{ delay: index * 0.04 }}
                                    >
                                        <FlatCard className="overflow-hidden p-6 sm:p-8">
                                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <Pill tone="navy">TRX-{transaction.id}</Pill>
                                                        <Pill tone={status.tone}>{status.label}</Pill>
                                                        {transaction.voucher_code && (
                                                            <Pill tone="gold">{transaction.voucher_code}</Pill>
                                                        )}
                                                        {transaction.payment_method_code && (
                                                            <Pill tone="gray">{transaction.payment_method_code}</Pill>
                                                        )}
                                                    </div>

                                                    <h3 className="mt-4 font-sans text-3xl font-extrabold uppercase leading-[0.95] text-[var(--brand-navy)]">
                                                        {transaction.ticket?.title || 'Untitled Ticket'}
                                                    </h3>
                                                    <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                                                        Dibuat pada {new Date(transaction.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })} • {transaction.quantity} tiket • Total Rp {Number(transaction.total_price).toLocaleString('id-ID')}
                                                    </p>

                                                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                                        <div className="rounded-2xl bg-[rgba(13,43,87,0.04)] px-4 py-4">
                                                            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                                                Event Date
                                                            </p>
                                                            <p className="mt-2 text-sm font-extrabold text-[var(--brand-navy)]">
                                                                {transaction.ticket?.event_date
                                                                    ? new Date(transaction.ticket.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                                    : 'TBA'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-2xl bg-[rgba(216,166,70,0.10)] px-4 py-4">
                                                            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#8a6827]">
                                                                Payment
                                                            </p>
                                                            <p className="mt-2 text-sm font-extrabold text-[var(--brand-navy)]">
                                                                {transaction.payment_status || 'Unknown'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-2xl bg-[rgba(13,43,87,0.04)] px-4 py-4">
                                                            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                                                Ticket Count
                                                            </p>
                                                            <p className="mt-2 text-sm font-extrabold text-[var(--brand-navy)]">
                                                                {transaction.quantity} orang
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid min-w-[220px] gap-3">
                                                    {transaction.payment_status === 'pending' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePayNow(transaction.snap_token)}
                                                            className="tix-pill-button px-6 py-4 text-sm"
                                                        >
                                                            Bayar Sekarang
                                                        </button>
                                                    )}

                                                    {transaction.payment_status === 'success' && (
                                                        <>
                                                            <Link
                                                                to={`/print/${transaction.id}`}
                                                                className="tix-pill-button px-6 py-4 text-center text-sm"
                                                            >
                                                                Buka E-Ticket
                                                            </Link>
                                                            <Link
                                                                to={`/receipt/${transaction.id}`}
                                                                className="cyber-btn rounded-2xl border border-[rgba(13,43,87,0.10)] bg-white px-6 py-4 text-center text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)]"
                                                            >
                                                                Cetak Struk
                                                            </Link>
                                                        </>
                                                    )}

                                                    {transaction.payment_status === 'failed' && (
                                                        <div className="rounded-2xl bg-rose-50 px-4 py-4 text-sm font-bold text-rose-600">
                                                            Pembayaran gagal. Silakan ulangi pemesanan dari halaman event.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </FlatCard>
                                    </MotionArticle>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
