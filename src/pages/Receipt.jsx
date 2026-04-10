import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { asArray } from '../utils/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

export default function Receipt() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await api.get('/transactions');
                const t = asArray(response.data).find(item => item.id == id);
                if (t && t.payment_status === 'success') {
                    setTransaction(t);
                    // Trigger print after data is loaded
                    setTimeout(() => {
                        window.print();
                    }, 800);
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
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!transaction) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans print:bg-white print:p-0 flex flex-col items-center">
            <Navbar />

            <div className="pt-32 pb-20 w-full max-w-4xl px-4 sm:px-6 lg:px-8 print:pt-0 print:pb-0">
                {/* Non-Printable Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 print:hidden">
                    <div>
                        <h2 className="text-2xl font-display font-black text-slate-800">Pembayaran Berhasil!</h2>
                        <p className="text-slate-500 font-medium">Struk pembayaran Anda telah diterbitkan.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Cetak Struk
                        </button>
                        <Link
                            to="/history"
                            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all"
                        >
                            Lihat Tiket Saya &rarr;
                        </Link>
                    </div>
                </div>

                {/* The Printable Receipt (Struk) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden print:shadow-none print:border-none print:rounded-none"
                >
                    {/* Invoice Header */}
                    <div className="p-8 sm:p-12 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-black text-sm">B</div>
                                <span className="font-black text-xl tracking-tight text-slate-900 uppercase">BANGSA <span className="text-primary-600">TIX.ID</span></span>
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">Official Payment Receipt</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Receipt Number</p>
                            <p className="text-xl font-mono font-bold text-slate-900">#INV-{transaction.id}-{new Date(transaction.created_at).getTime().toString().slice(-4)}</p>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        {/* Transaction Metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ditujukan Untuk</p>
                                <p className="font-bold text-slate-900">{transaction.user?.name || 'Customer'}</p>
                                <p className="text-sm text-slate-500 truncate">{transaction.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal</p>
                                <p className="font-bold text-slate-900">{new Date(transaction.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-sm text-slate-500">{new Date(transaction.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    PAID SUCCESS
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Metode Bayar</p>
                                <p className="font-bold text-slate-900 uppercase">{transaction.payment_method_code || 'Midtrans Online'}</p>
                            </div>
                        </div>

                        {/* Order Details Table */}
                        <div className="overflow-hidden border border-slate-200 rounded-2xl mb-12">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Detail Item</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Harga</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Jumlah</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="px-6 py-6">
                                            <p className="font-bold text-slate-900 mb-1">{transaction.ticket?.title}</p>
                                            <p className="text-xs text-slate-400">Event Date: {new Date(transaction.ticket?.event_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                                        </td>
                                        <td className="px-6 py-6 text-center text-slate-600 font-medium text-sm">
                                            Rp {Number(transaction.ticket?.price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-6 text-center text-slate-900 font-bold">
                                            {transaction.quantity}
                                        </td>
                                        <td className="px-6 py-6 text-right text-slate-900 font-black">
                                            Rp {Number(transaction.total_price).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex flex-col items-end space-y-3">
                            <div className="w-full max-w-xs space-y-3">
                                <div className="flex justify-between text-slate-500 text-sm font-medium">
                                    <span>Total Tiket</span>
                                    <span>Rp {Number(transaction.original_price || transaction.total_price).toLocaleString('id-ID')}</span>
                                </div>
                                {Number(transaction.discount_amount) > 0 && (
                                    <div className="flex justify-between text-emerald-600 text-sm font-medium">
                                        <span>Diskon Membership</span>
                                        <span>- Rp {Number(transaction.discount_amount).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                {Number(transaction.voucher_discount_amount) > 0 && (
                                    <div className="flex justify-between text-emerald-600 text-sm font-medium">
                                        <span>Voucher {transaction.voucher_code || ''}</span>
                                        <span>- Rp {Number(transaction.voucher_discount_amount).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-500 text-sm font-medium">
                                    <span>Pajak (0%)</span>
                                    <span>Rp 0</span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-sm font-medium">
                                    <span>Biaya Layanan</span>
                                    <span className="text-emerald-600 font-bold uppercase text-[10px]">Lunas</span>
                                </div>
                                <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                                    <span className="font-black text-slate-900 text-lg uppercase tracking-tight">Total Akhir</span>
                                    <span className="text-3xl font-display font-black text-primary-600">
                                        Rp {Number(transaction.total_price).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Disclaimer */}
                        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-400 text-sm font-medium italic mb-2">Terima kasih telah menggunakan BANGSA TIX.ID</p>
                            <p className="text-slate-300 text-[10px] leading-relaxed uppercase tracking-wider">
                                Struk ini adalah bukti pembayaran yang sah. <br />
                                Harap simpan struk ini sebagai referensi jika terjadi kendala pada tiket Anda.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 1cm; size: auto; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    nav { display: none !important; }
                    .print-hidden { display: none !important; }
                }
            `}} />
        </div>
    );
}

