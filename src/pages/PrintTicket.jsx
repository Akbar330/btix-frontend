import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { asArray } from '../utils/api';
import { LoadingScreen } from '../components/TixUI';

export default function PrintTicket() {
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
                    setTimeout(() => window.print(), 500);
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

    if (loading) return <LoadingScreen label="Menyiapkan e-ticket..." />;
    if (!transaction) return null;

    return (
        <div className="min-h-screen bg-[var(--brand-paper)] p-8 print:bg-white print:p-0">
            <div className="mx-auto mb-8 flex w-full max-w-3xl items-center justify-between print:hidden">
                <button type="button" onClick={() => navigate('/history')} className="cyber-btn rounded-2xl border border-[rgba(13,43,87,0.10)] bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)]">
                    Kembali
                </button>
                <button type="button" onClick={() => window.print()} className="tix-pill-button px-6 py-3 text-sm">
                    Print Ticket
                </button>
            </div>

            <div className="mx-auto flex flex-col md:flex-row w-full max-w-3xl overflow-hidden rounded-2xl border border-[rgba(13,43,87,0.08)] bg-white shadow-[0_24px_60px_rgba(16,39,74,0.16)] print:flex-row print:rounded-none print:border-[3px] print:border-[var(--brand-navy)] print:shadow-none">
                <div className="flex md:w-[34%] flex-col items-center justify-center bg-[linear-gradient(180deg,#0d2b57_0%,#143d79_45%,#d8a646_180%)] px-6 py-10 text-center text-white border-b-2 border-dashed border-white/30 md:border-b-0 print:w-[34%] print:border-b-0 print:border-r-[3px] print:border-dashed print:border-white/60">
                    <div className="tix-brand text-[1.8rem] sm:text-[2.2rem] leading-none text-white">
                        BANGSA TIX<span className="tix-brand-mark" />ID
                    </div>
                    <p className="mt-6 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#ffe7aa]">
                        Verified Pass
                    </p>

                    <div className="mt-6 rounded-2xl bg-white p-3 shadow-inner max-w-full">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ticket-${transaction.id}-${transaction.user_id}-${transaction.ticket_id}`}
                            alt="QR Code"
                            className="aspect-square w-[180px] max-w-full h-auto object-contain"
                        />
                    </div>

                    <p className="mt-6 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/70">Pass ID</p>
                    <p className="mt-2 text-xl font-extrabold">#{transaction.id}-{transaction.ticket_id}</p>
                </div>

                <div className="relative flex-1 px-8 py-10">
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[rgba(13,43,87,0.04)] print:hidden" />

                    <div className="relative z-10">
                        <span className="inline-flex rounded-2xl border border-[rgba(26,140,86,0.18)] bg-[rgba(26,140,86,0.08)] px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#1c7a50]">
                            Verified Payment
                        </span>
                        <h1 className="mt-5 font-sans text-4xl font-extrabold uppercase leading-[0.92] text-[var(--brand-navy)]">
                            {transaction.ticket.title}
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                            {transaction.ticket.description}
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-dashed border-[rgba(13,43,87,0.14)] py-8">
                            <TicketMeta label="Date" value={new Date(transaction.ticket.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            <TicketMeta label="Admit" value={`${transaction.quantity} Person(s)`} />
                            <TicketMeta label="Customer" value={transaction.user?.name || 'Guest'} />
                            <TicketMeta label="Total Paid" value={`Rp ${Number(transaction.total_price).toLocaleString('id-ID')}`} />
                        </div>

                        <div className="mt-8 text-center text-xs leading-6 text-[var(--text-muted)]">
                            <p>This is a valid e-ticket. Please present the QR code at the entrance.</p>
                            <p className="mt-1">Issued by TIX ID on {new Date(transaction.created_at).toLocaleString()}</p>
                        </div>

                        {transaction.is_scanned && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="rounded-2xl border-[6px] border-rose-400/30 px-10 py-4 -rotate-12">
                                    <span className="font-sans text-6xl font-extrabold uppercase tracking-tight text-rose-400/40">
                                        Used
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `,
            }} />
        </div>
    );
}

function TicketMeta({ label, value }) {
    return (
        <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
            <p className="mt-2 font-extrabold text-[var(--brand-navy)]">{value}</p>
        </div>
    );
}
