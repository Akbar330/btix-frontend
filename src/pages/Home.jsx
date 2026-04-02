import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { asArray } from '../utils/api';
import Navbar from '../components/Navbar';

const API_BASE = '';

const formatPrice = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const statusLabel = {
    draft: 'Draft',
    published: 'Published',
    sold_out: 'Sold Out',
    ended: 'Ended',
};

export default function Home() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        sort: 'event_date_asc',
        upcomingOnly: true,
    });

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const response = await api.get('/tickets', {
                    params: {
                        search: filters.search || undefined,
                        category: filters.category !== 'all' ? filters.category : undefined,
                        sort: filters.sort,
                        upcoming_only: filters.upcomingOnly,
                    },
                });

                setTickets(asArray(response.data));
                setCategories(response.data?.filters?.categories || []);
            } catch (error) {
                console.error('Failed to fetch tickets', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [filters]);

    const featuredTickets = tickets.slice(0, 3);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <Navbar />

            <div className="absolute top-0 -left-[20%] w-[70%] h-[500px] bg-primary-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 pointer-events-none z-0" />
            <div className="absolute top-[20%] -right-[10%] w-[50%] h-[600px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 pointer-events-none z-0" />

            <div className="pt-24 pb-20 max-w-7xl mx-auto relative z-10">
                <section className="px-4 sm:px-6 lg:px-8 mb-10">
                    <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_12px_40px_rgba(15,23,42,0.06)] overflow-hidden">
                        <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-0">
                            <div className="p-8 sm:p-10 lg:p-14">
                                <span className="inline-flex px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-black uppercase tracking-[0.25em] border border-primary-100">
                                    Event Discovery
                                </span>
                                <h1 className="mt-6 text-4xl sm:text-5xl font-display font-black tracking-tight text-slate-900 leading-tight">
                                    Cari event yang pas, <br />
                                    beli tiket lebih cepat.
                                </h1>
                                <p className="mt-5 text-slate-500 text-lg max-w-2xl">
                                    Sekarang kamu bisa filter event berdasarkan kategori, urutkan harga atau tanggal, dan lihat status event secara langsung sebelum checkout.
                                </p>

                                <div className="mt-8 grid gap-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={filters.search}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                            placeholder="Cari event, kota, venue, atau organizer..."
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-3">
                                        <select
                                            value={filters.category}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="all">Semua kategori</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={filters.sort}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="event_date_asc">Tanggal terdekat</option>
                                            <option value="price_asc">Harga termurah</option>
                                            <option value="price_desc">Harga termahal</option>
                                            <option value="title_asc">Nama A-Z</option>
                                            <option value="quota_desc">Kuota terbanyak</option>
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => setFilters((prev) => ({ ...prev, upcomingOnly: !prev.upcomingOnly }))}
                                            className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-colors ${filters.upcomingOnly
                                                ? 'border-primary-200 bg-primary-50 text-primary-700'
                                                : 'border-slate-200 bg-white text-slate-600'
                                                }`}
                                        >
                                            {filters.upcomingOnly ? 'Hanya upcoming' : 'Semua tanggal'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Platform Snapshot</p>
                                    <div className="mt-8 grid grid-cols-2 gap-4">
                                        <div className="rounded-3xl bg-white/10 border border-white/10 p-5">
                                            <p className="text-3xl font-black">{tickets.length}</p>
                                            <p className="text-sm text-slate-300 mt-1">event tampil</p>
                                        </div>
                                        <div className="rounded-3xl bg-white/10 border border-white/10 p-5">
                                            <p className="text-3xl font-black">{categories.length}</p>
                                            <p className="text-sm text-slate-300 mt-1">kategori aktif</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 rounded-[2rem] bg-white/10 border border-white/10 p-6">
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Admin sekarang bisa mengatur status event, metode pembayaran, voucher, dan analytics supaya katalog event terasa lebih realistis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {!loading && featuredTickets.length > 0 && (
                    <section className="px-4 sm:px-6 lg:px-8 mb-12">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-2xl font-display font-black text-slate-900">Sorotan Event</h2>
                            <p className="text-sm font-medium text-slate-500">Pilihan teratas dari katalog kamu</p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {featuredTickets.map((ticket, index) => (
                                <Link to={`/ticket/${ticket.id}`} key={ticket.id} className="group">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                        className="relative min-h-[340px] rounded-[2rem] overflow-hidden shadow-[0_12px_36px_rgba(15,23,42,0.10)]"
                                    >
                                        {ticket.image ? (
                                            <img src={`${API_BASE}/storage/${ticket.image}`} alt={ticket.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-900" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/15 text-[11px] font-black uppercase tracking-[0.2em]">
                                                    {ticket.category || 'General'}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/15 text-[11px] font-black uppercase tracking-[0.2em]">
                                                    {statusLabel[ticket.status] || ticket.status}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-display font-black leading-tight">{ticket.title}</h3>
                                            <p className="text-sm text-slate-200 mt-2 line-clamp-2">{ticket.description}</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section className="px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                        <div>
                            <h2 className="text-2xl font-display font-black text-slate-900">Semua Event</h2>
                            <p className="text-slate-500 text-sm mt-1">Menampilkan event yang cocok dengan filter aktif</p>
                        </div>
                        <p className="text-sm font-bold text-slate-500">{tickets.length} event ditemukan</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="relative w-14 h-14">
                                <div className="absolute inset-0 rounded-full border-t-4 border-primary-500 animate-spin" />
                                <div className="absolute inset-2 rounded-full border-r-4 border-indigo-400 animate-spin" />
                            </div>
                        </div>
                    ) : tickets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {tickets.map((ticket, index) => (
                                <Link to={`/ticket/${ticket.id}`} key={ticket.id} className="group">
                                    <motion.article
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ delay: index * 0.04 }}
                                        className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] overflow-hidden shadow-[0_8px_28px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.12)] hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                            {ticket.image ? (
                                                <img src={`${API_BASE}/storage/${ticket.image}`} alt={ticket.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100" />
                                            )}

                                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                <span className="px-3 py-1 rounded-full bg-white/90 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">
                                                    {ticket.category || 'General'}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.18em] ${ticket.status === 'sold_out'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : ticket.status === 'ended'
                                                        ? 'bg-slate-200 text-slate-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {statusLabel[ticket.status] || ticket.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">
                                                <span>{ticket.city || 'Online / TBA'}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                <span>{new Date(ticket.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>

                                            <h3 className="text-xl font-display font-black text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">
                                                {ticket.title}
                                            </h3>
                                            <p className="text-slate-500 text-sm mt-2 line-clamp-2 min-h-[2.5rem]">{ticket.description}</p>

                                            <div className="mt-5 flex items-end justify-between">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Mulai dari</p>
                                                    <p className="text-2xl font-display font-black text-slate-900">{formatPrice(ticket.price)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.18em]">Kuota</p>
                                                    <p className="text-sm font-bold text-slate-700">{ticket.quota}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/60 rounded-[2rem] border border-white shadow-sm">
                            <h3 className="text-2xl font-display font-black text-slate-900">Event belum ketemu</h3>
                            <p className="text-slate-500 mt-2">Coba ubah pencarian, kategori, atau matikan filter upcoming.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
