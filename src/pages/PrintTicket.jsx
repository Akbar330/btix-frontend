import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { asArray } from '../utils/api';
import Navbar from '../components/Navbar';

export default function PrintTicket() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                // Since there is no specific /transactions/:id endpoint, we reuse index
                const response = await api.get('/transactions');
                const t = asArray(response.data).find(item => item.id == id);
                if (t && t.payment_status === 'success') {
                    setTransaction(t);
                    // Automatically trigger print dialog once data is loaded and rendered
                    setTimeout(() => {
                        window.print();
                    }, 500);
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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    if (!transaction) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8 print:p-0 print:bg-white flex flex-col items-center">
            {/* The non-printable header for users viewing this page without printing */}
            <div className="max-w-3xl w-full mb-8 flex justify-between items-center print:hidden">
                <button onClick={() => navigate('/history')} className="text-primary-600 font-bold hover:underline">&larr; Back to History</button>
                <button onClick={() => window.print()} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold shadow-md">Print Output</button>
            </div>

            {/* The actual Printable Ticket */}
            <div className="w-full max-w-3xl bg-white border-2 border-slate-200 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.1)] print:shadow-none print:border-4 print:border-slate-800">
                {/* Left side styling - branding and QR */}
                <div className="bg-primary-600 text-white p-8 md:w-1/3 flex flex-col items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-dashed border-white/50 print:bg-slate-100 print:text-slate-900 print:border-slate-800">
                    <div className="font-display font-extrabold text-3xl mb-8 tracking-tight uppercase">BANGSA <span className="text-primary-300 print:text-primary-600">TIX.ID</span></div>

                    <div className="bg-white p-3 rounded-2xl shadow-inner mb-6">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ticket-${transaction.id}-${transaction.user_id}-${transaction.ticket_id}`} alt="QR Code" className="w-[150px] h-[150px]" />
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-primary-200 print:text-slate-500 mb-1">Pass ID</p>
                    <p className="text-xl font-mono block">#{transaction.id}-{transaction.ticket_id}</p>
                </div>

                {/* Right side styling - ticket details */}
                <div className="p-8 md:p-12 md:w-2/3 bg-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0 print:hidden"></div>

                    <div className="relative z-10">
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200 print:border-slate-400 print:text-slate-900 print:bg-transparent">
                                Verified Payment
                            </span>
                            <h2 className="text-3xl font-display font-extrabold text-slate-900 leading-tight mb-2 uppercase">{transaction.ticket.title}</h2>
                            <p className="text-slate-500 text-sm font-medium">{transaction.ticket.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8 pb-8 border-b border-slate-200 border-dashed print:border-slate-400">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                <p className="font-bold text-slate-900">{new Date(transaction.ticket.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Admit</p>
                                <p className="font-bold text-slate-900">{transaction.quantity} Person(s)</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                                <p className="font-bold text-slate-900">{transaction.user?.name || 'Guest'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                                <p className="font-bold text-slate-900">Rp {Number(transaction.total_price).toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        <div className="text-center text-xs text-slate-400 font-medium">
                            <p>This is a valid E-Ticket. Please present the QR code at the entrance.</p>
                            <p className="mt-1">Issued by BANGSA TIX.ID on {new Date(transaction.created_at).toLocaleString()}</p>
                        </div>

                        {transaction.is_scanned && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                <div className="border-8 border-rose-500/30 px-10 py-4 rounded-3xl -rotate-12">
                                    <span className="text-rose-500/40 text-6xl font-black font-display uppercase tracking-tighter">
                                        SUDAH TERPAKAI
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print specific CSS injected locally */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}} />
        </div>
    );
}
