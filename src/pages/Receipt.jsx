import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { asArray } from '../utils/api';
import { LoadingScreen, PageHero, FlatCard } from '../components/TixUI';

export default function Receipt() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await api.get('/transactions');
                const current = asArray(response.data).find((item) => item.id == id);
                if (current && current.payment_status === 'success') {
                    setTransaction(current);
                    setTimeout(() => window.print(), 800);
                } else {
                    navigate('/history');
                }
            } catch (error) {
                console.error(error);
                navigate('/history');
            } finally {
                setLoading(false);
            }
        };
        fetchTransaction();
    }, [id, navigate]);

    if (loading) return <LoadingScreen label="Menyiapkan struk pembayaran..." />;
    if (!transaction) return null;

    return (
        <div className="page-shell min-h-screen print:bg-white">
            

            <div className="print:hidden">
                <PageHero
                    eyebrow="Payment Receipt"
                    title="Pembayaran Berhasil"
                    description="Struk pembayaran sudah siap. Tampilan ini juga sudah disamakan dengan bahasa visual TIX ID yang baru."
                    actions={
                        <>
                            <button type="button" onClick={() => window.print()} className="tix-pill-button px-7 py-4 text-sm">
                                Cetak Struk
                            </button>
                            <Link to="/history" className="cyber-btn rounded-2xl border border-[rgba(13,43,87,0.10)] bg-white px-6 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)]">
                                Tiket Saya
                            </Link>
                        </>
                    }
                />
            </div>

            <div className="tix-container pb-20 print:w-full print:max-w-none print:px-0 print:pb-0">
                <FlatCard className="mt-12 overflow-hidden print:mt-0 print:rounded-none print:border-none print:shadow-none">
                    <div className="border-b border-[rgba(13,43,87,0.08)] bg-[rgba(13,43,87,0.03)] px-8 py-8 sm:px-12 print:bg-white">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="tix-brand text-[2.8rem] leading-none">
                                    TIX<span className="tix-brand-mark" />ID
                                </div>
                                <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--brand-gold)]">
                                    Official Payment Receipt
                                </p>
                            </div>
                            <div className="md:text-right">
                                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                    Receipt Number
                                </p>
                                <p className="mt-2 text-xl font-extrabold text-[var(--brand-navy)]">
                                    INV-{transaction.id}-{new Date(transaction.created_at).getTime().toString().slice(-4)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-10 px-8 py-8 sm:px-12 sm:py-12">
                        <div className="grid gap-5 md:grid-cols-4">
                            <MetaBlock label="Ditujukan Untuk" value={transaction.user?.name || 'Customer'} subvalue={transaction.user?.email} />
                            <MetaBlock label="Tanggal" value={new Date(transaction.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} subvalue={new Date(transaction.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} />
                            <MetaBlock label="Status" value="Paid Success" />
                            <MetaBlock label="Metode Bayar" value={(transaction.payment_method_code || 'midtrans').toUpperCase()} />
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-[rgba(13,43,87,0.08)]">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-[rgba(13,43,87,0.03)]">
                                        <th className="px-6 py-4 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">Detail Item</th>
                                        <th className="px-6 py-4 text-center text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">Harga</th>
                                        <th className="px-6 py-4 text-center text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">Jumlah</th>
                                        <th className="px-6 py-4 text-right text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-[rgba(13,43,87,0.08)]">
                                        <td className="px-6 py-6">
                                            <p className="font-extrabold text-[var(--brand-navy)]">{transaction.ticket?.title}</p>
                                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                Event Date: {new Date(transaction.ticket?.event_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-6 text-center text-sm font-semibold text-[var(--brand-navy)]">
                                            Rp {Number(transaction.ticket?.price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-6 text-center text-sm font-extrabold text-[var(--brand-navy)]">
                                            {transaction.quantity}
                                        </td>
                                        <td className="px-6 py-6 text-right text-sm font-extrabold text-[var(--brand-navy)]">
                                            Rp {Number(transaction.total_price).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end">
                            <div className="w-full max-w-sm space-y-3">
                                <PriceRow label="Total Tiket" value={transaction.original_price || transaction.total_price} />
                                {Number(transaction.discount_amount) > 0 && (
                                    <PriceRow label="Diskon Membership" value={-transaction.discount_amount} highlight />
                                )}
                                {Number(transaction.voucher_discount_amount) > 0 && (
                                    <PriceRow label={`Voucher ${transaction.voucher_code || ''}`} value={-transaction.voucher_discount_amount} highlight />
                                )}
                                <PriceRow label="Pajak" value={0} />
                                <div className="border-t border-[rgba(13,43,87,0.08)] pt-4">
                                    <div className="flex items-end justify-between">
                                        <span className="text-lg font-extrabold uppercase tracking-[0.08em] text-[var(--brand-navy)]">
                                            Total Akhir
                                        </span>
                                        <span className="font-sans text-4xl font-extrabold uppercase text-[var(--brand-navy)]">
                                            Rp {Number(transaction.total_price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[rgba(13,43,87,0.08)] pt-8 text-center">
                            <p className="text-sm italic text-[var(--text-muted)]">
                                Terima kasih telah menggunakan TIX ID.
                            </p>
                            <p className="mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                Simpan struk ini sebagai bukti pembayaran yang sah.
                            </p>
                        </div>
                    </div>
                </FlatCard>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 1cm; size: auto; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    nav { display: none !important; }
                }
            `,
            }} />
        </div>
    );
}

function MetaBlock({ label, value, subvalue }) {
    return (
        <div className="rounded-2xl bg-[rgba(13,43,87,0.04)] px-4 py-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
            <p className="mt-2 font-extrabold text-[var(--brand-navy)]">{value}</p>
            {subvalue && <p className="mt-1 text-sm text-[var(--text-muted)]">{subvalue}</p>}
        </div>
    );
}

function PriceRow({ label, value, highlight = false }) {
    const amount = Number(value || 0);
    const negative = amount < 0;
    return (
        <div className={`flex items-center justify-between text-sm ${highlight ? 'text-[#1c7a50]' : 'text-[var(--text-muted)]'}`}>
            <span>{label}</span>
            <span className="font-extrabold text-[var(--brand-navy)]">
                {negative ? '- ' : ''}Rp {Math.abs(amount).toLocaleString('id-ID')}
            </span>
        </div>
    );
}
