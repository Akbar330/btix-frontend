import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { asArray } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
        <div className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="pt-28 pb-20 max-w-7xl mx-auto relative z-10">
                <section className="px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden border border-amber-500/20 shadow-xl">
                        <div className="grid lg:grid-cols-2 gap-0">
                            <div className="p-8 sm:p-12 lg:p-14">
                                <div className="inline-flex px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-6">
                                    <span className="text-amber-500 text-xs font-black uppercase tracking-[0.2em]">
                                        🎫 Cari Event
                                    </span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
                                    Temukan Event <br />
                                    <span className="text-amber-400">Favorit Kamu</span>
                                </h1>
                                <p className="text-gray-300 text-base max-w-xl">
                                    Cari, filter, dan pesan tiket event impian mu dengan mudah. Dari konser hingga workshop, semua ada di sini.
                                </p>

                                <div className="mt-8 grid gap-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={filters.search}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                            placeholder="Cari event, kota, venue..."
                                            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-3">
                                        <select
                                            value={filters.category}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                                            className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        >
                                            <option value="all">Semua kategori</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={filters.sort}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                                            className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                                            className={`rounded-lg border px-3 py-3 text-sm font-bold transition-all ${filters.upcomingOnly
                                                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                                : 'border-gray-700 bg-gray-800/50 text-gray-400'
                                                }`}
                                        >
                                            {filters.upcomingOnly ? '✓ Upcoming' : 'Semua Tanggal'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-8 sm:p-12 border-l border-amber-500/20 hidden lg:flex flex-col justify-center">
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">Total Event</p>
                                        <p className="text-4xl font-black text-white">{tickets.length}</p>
                                    </div>
                                    <div className="h-px bg-amber-500/30"></div>
                                    <div className="text-center">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">Kategori</p>
                                        <p className="text-3xl font-black text-amber-400">{categories.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {!loading && featuredTickets.length > 0 && (
                    <section className="px-4 sm:px-6 lg:px-8 mb-16">
                        <h2 className="text-3xl font-black text-white mb-2">✨ Event Unggulan</h2>
                        <p className="text-gray-400 text-sm mb-8">Event-event terbaik yang tidak boleh kamu lewatkan</p>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {featuredTickets.map((ticket, index) => (
                                <Link to={`/ticket/${ticket.id}`} key={ticket.id} className="group">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                        className="relative min-h-[340px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-gray-800 to-black border border-amber-500/20 group-hover:border-amber-500/40"
                                    >
                                        {ticket.image ? (
                                            <img src={`${API_BASE}/storage/${ticket.image}`} alt={ticket.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wide bg-amber-500/30 border border-amber-500/60 text-amber-300">
                                                    {ticket.category || 'General'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${ticket.status === 'sold_out'
                                                    ? 'bg-red-500/30 border border-red-500/60 text-red-300'
                                                    : ticket.status === 'ended'
                                                        ? 'bg-gray-500/30 border border-gray-500/60 text-gray-300'
                                                        : 'bg-green-500/30 border border-green-500/60 text-green-300'
                                                    }`}>
                                                    {statusLabel[ticket.status] || ticket.status}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black leading-tight">{ticket.title}</h3>
                                            <p className="text-sm text-gray-300 mt-2 line-clamp-2">{ticket.description}</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section className="px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900">🎫 Semua Event</h2>
                            <p className="text-gray-600 text-sm mt-1">{tickets.length} event tersedia sesuai filter</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="relative w-14 h-14">
                                <div className="absolute inset-0 rounded-full border-t-4 border-amber-500 animate-spin" />
                                <div className="absolute inset-2 rounded-full border-r-4 border-amber-400 animate-spin" style={{ animationDirection: 'reverse' }} />
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
                                        className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:border-amber-500/50 transition-all duration-300"
                                    >
                                        <div className="aspect-[4/3] bg-gray-900 relative overflow-hidden">
                                            {ticket.image ? (
                                                <img src={`${API_BASE}/storage/${ticket.image}`} alt={ticket.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                                            )}

                                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-black">
                                                    {ticket.category || 'General'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${ticket.status === 'sold_out'
                                                    ? 'bg-red-500/90 text-white'
                                                    : ticket.status === 'ended'
                                                        ? 'bg-gray-600/90 text-gray-100'
                                                        : 'bg-green-500/90 text-white'
                                                    }`}>
                                                    {statusLabel[ticket.status] || ticket.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                                                <span>{ticket.city || 'Online'}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                <span>{new Date(ticket.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>

                                            <h3 className="text-base font-bold text-white leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                                                {ticket.title}
                                            </h3>
                                            <p className="text-gray-400 text-xs mt-1 line-clamp-2 min-h-[1.5rem]">{ticket.description}</p>

                                            <div className="mt-4 flex items-end justify-between pt-3 border-t border-gray-700">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dari</p>
                                                    <p className="text-lg font-black text-white">{formatPrice(ticket.price)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Slot</p>
                                                    <p className="text-sm font-bold text-gray-300">{ticket.quota}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-black text-white">Event tidak ditemukan</h3>
                            <p className="text-gray-400 text-sm mt-2">Coba ubah filter atau kata kunci pencarian</p>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
}
