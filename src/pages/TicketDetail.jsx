import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { asObject } from '../utils/api';
import Navbar from '../components/Navbar';

const API_BASE = '';

const statusConfig = {
    draft: { label: 'Draft', className: 'bg-slate-200 text-slate-700' },
    published: { label: 'Published', className: 'bg-emerald-100 text-emerald-700' },
    sold_out: { label: 'Sold Out', className: 'bg-rose-100 text-rose-700' },
    ended: { label: 'Ended', className: 'bg-amber-100 text-amber-700' },
};

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

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

        fetchTicket();
    }, [id]);

    const highlights = useMemo(() => (
        String(ticket?.highlights || '')
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean)
    ), [ticket]);

    const terms = useMemo(() => (
        String(ticket?.terms || '')
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean)
    ), [ticket]);

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
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-display font-black text-slate-900">Event tidak ditemukan</h2>
                    <Link to="/" className="mt-4 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">Kembali ke beranda</Link>
                </div>
            </div>
        );
    }

    const status = statusConfig[ticket.status] || statusConfig.published;
    const canCheckout = ticket.status === 'published' && ticket.quota > 0;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <Navbar />

            <div className="absolute top-20 -left-20 w-[60%] h-[500px] bg-sky-300/30 rounded-full filter blur-[120px] opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[50%] h-[600px] bg-primary-400/20 rounded-full filter blur-[120px] opacity-70 pointer-events-none" />

            <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 mb-6">
                    <span>&larr;</span>
                    <span>Kembali ke event</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid lg:grid-cols-[1.05fr,0.95fr] gap-8"
                >
                    <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] overflow-hidden shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                        <div className="aspect-[4/3] relative overflow-hidden">
                            {ticket.image ? (
                                <img src={`${API_BASE}/storage/${ticket.image}`} alt={ticket.title} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-700" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                            <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                                    {ticket.category || 'General'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InfoCard label="Tanggal" value={new Date(ticket.event_date).toLocaleDateString('id-ID', { dateStyle: 'full' })} />
                                <InfoCard label="Lokasi" value={[ticket.venue, ticket.city].filter(Boolean).join(', ') || 'TBA'} />
                                <InfoCard label="Organizer" value={ticket.organizer || 'BANGSA TIX.ID'} />
                                <InfoCard label="Kuota" value={`${ticket.quota} tiket`} />
                            </div>

                            {highlights.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-display font-black text-slate-900 mb-3">Highlight Event</h3>
                                    <div className="grid gap-3">
                                        {highlights.map((item, index) => (
                                            <div key={index} className="rounded-2xl bg-primary-50 border border-primary-100 px-4 py-3 text-slate-700 font-medium">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] p-8 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-600">Event Overview</p>
                            <h1 className="mt-4 text-4xl font-display font-black tracking-tight text-slate-900 leading-tight">
                                {ticket.title}
                            </h1>
                            <p className="mt-5 text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {ticket.description}
                            </p>

                            <div className="mt-8 pt-8 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Harga mulai</p>
                                    <p className="mt-2 text-4xl font-display font-black text-slate-900">
                                        Rp {Number(ticket.price).toLocaleString('id-ID')}
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate(`/checkout/${ticket.id}`)}
                                    disabled={!canCheckout}
                                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-black shadow-[0_12px_30px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {canCheckout ? 'Lanjut Checkout' : 'Belum Tersedia'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                            <h2 className="text-2xl font-display font-black text-slate-900">Syarat & Ketentuan</h2>
                            {terms.length > 0 ? (
                                <ul className="mt-5 space-y-3 text-slate-600">
                                    {terms.map((item, index) => (
                                        <li key={index} className="flex gap-3">
                                            <span className="text-blue-600 font-black">{String(index + 1).padStart(2, '0')}</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-4 text-slate-600">
                                    Tiket yang sudah dibeli mengikuti kebijakan penyelenggara event. Simpan bukti pembelian dan e-ticket untuk proses check-in.
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="rounded-[1.5rem] bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="mt-2 text-slate-800 font-bold leading-relaxed">{value}</p>
        </div>
    );
}
