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

const statusStyle = {
    sold_out: 'bg-red-500/20 border-red-500/40 text-red-300',
    ended: 'bg-slate-600/30 border-slate-500/40 text-slate-400',
    published: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    draft: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
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
        <div className="min-h-screen" style={{ background: '#020817' }}>
            <Navbar />

            {/* Hero Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 animate-orb"
                    style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translateY(-50%)' }} />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'orb 20s ease-in-out infinite reverse' }} />
                <div className="absolute inset-0 cyber-grid opacity-30" />
            </div>

            <div className="pt-28 pb-20 max-w-7xl mx-auto relative z-10">

                {/* ====== HERO SEARCH SECTION ====== */}
                <section className="px-4 sm:px-6 lg:px-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="corner-accent relative overflow-hidden rounded-2xl"
                        style={{
                            background: 'rgba(6,15,35,0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(14,165,233,0.15)',
                            boxShadow: '0 0 40px rgba(14,165,233,0.05)',
                        }}
                    >
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

                        <div className="grid lg:grid-cols-2 gap-0">
                            <div className="p-8 sm:p-12 lg:p-14">
                                {/* Badge */}
                                <div className="inline-flex px-3 py-1.5 rounded-lg mb-6"
                                    style={{
                                        background: 'rgba(14,165,233,0.08)',
                                        border: '1px solid rgba(14,165,233,0.2)',
                                    }}>
                                    <span className="text-cyan-400 text-xs font-black uppercase tracking-[0.2em]">
                                        ⚡ Cari Event
                                    </span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
                                    Temukan Event <br />
                                    <span className="text-gradient-cyan">Favorit Kamu</span>
                                </h1>
                                <p className="text-slate-400 text-base max-w-xl">
                                    Cari, filter, dan pesan tiket event impian mu dengan mudah. Dari konser hingga workshop, semua ada di sini.
                                </p>

                                <div className="mt-8 grid gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={filters.search}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                            placeholder="Cari event, kota, venue..."
                                            className="cyber-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-3">
                                        <select
                                            value={filters.category}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                                            className="cyber-input w-full px-3 py-3 rounded-xl text-sm font-medium"
                                        >
                                            <option value="all" style={{ background: '#060f1e' }}>Semua kategori</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category} style={{ background: '#060f1e' }}>{category}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={filters.sort}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                                            className="cyber-input w-full px-3 py-3 rounded-xl text-sm font-medium"
                                        >
                                            <option value="event_date_asc" style={{ background: '#060f1e' }}>Tanggal terdekat</option>
                                            <option value="price_asc" style={{ background: '#060f1e' }}>Harga termurah</option>
                                            <option value="price_desc" style={{ background: '#060f1e' }}>Harga termahal</option>
                                            <option value="title_asc" style={{ background: '#060f1e' }}>Nama A-Z</option>
                                            <option value="quota_desc" style={{ background: '#060f1e' }}>Kuota terbanyak</option>
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => setFilters((prev) => ({ ...prev, upcomingOnly: !prev.upcomingOnly }))}
                                            className={`w-full px-3 py-3 rounded-xl text-sm font-bold transition-all ${filters.upcomingOnly
                                                ? 'text-cyan-400 border border-cyan-400/30 bg-cyan-400/8 shadow-[0_0_12px_rgba(14,165,233,0.15)]'
                                                : 'text-slate-400 border border-slate-700 bg-transparent'
                                            }`}
                                        >
                                            {filters.upcomingOnly ? '⚡ Upcoming' : 'Semua Tanggal'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Panel */}
                            <div className="hidden lg:flex flex-col justify-center p-14 border-l"
                                style={{ borderColor: 'rgba(14,165,233,0.1)' }}>
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-2 font-mono">Total Event</p>
                                        <p className="text-5xl font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{tickets.length}</p>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                                    <div className="text-center">
                                        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-2 font-mono">Kategori</p>
                                        <p className="text-4xl font-black text-gradient-cyan" style={{ fontFamily: 'Orbitron, monospace' }}>{categories.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                    </motion.div>
                </section>

                {/* ====== FEATURED EVENTS ====== */}
                {!loading && featuredTickets.length > 0 && (
                    <section className="px-4 sm:px-6 lg:px-8 mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-white">Event Unggulan</h2>
                                <p className="text-slate-500 text-sm mt-1">Event terbaik yang tidak boleh kamu lewatkan</p>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
                            <span className="text-xs font-mono text-cyan-500/60 uppercase tracking-widest">FEATURED</span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                            {featuredTickets.map((ticket, index) => (
                                <Link to={`/ticket/${ticket.id}`} key={ticket.id} className="group">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                        className="relative min-h-[260px] sm:min-h-[340px] rounded-xl overflow-hidden transition-all duration-500"
                                        style={{
                                            border: '1px solid rgba(14,165,233,0.15)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                        }}
                                    >
                                        {ticket.image ? (
                                            <img src={ticket.image.startsWith('http') ? ticket.image : `${API_BASE}/storage/${ticket.image}`} alt={ticket.title}
                                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/90 via-[#020817]/40 to-transparent" />

                                        {/* Neon border on hover */}
                                        <div className="absolute inset-0 rounded-xl border border-cyan-400/0 group-hover:border-cyan-400/30 transition-all duration-500"
                                            style={{ boxShadow: '0 0 0px rgba(14,165,233,0)' }} />

                                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white">
                                            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                                                <span className="px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wide border"
                                                    style={{ background: 'rgba(14,165,233,0.2)', border: '1px solid rgba(14,165,233,0.4)', color: '#7dd3fc' }}>
                                                    {ticket.category || 'General'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wide border ${statusStyle[ticket.status] || statusStyle.published}`}>
                                                    {statusLabel[ticket.status] || ticket.status}
                                                </span>
                                            </div>
                                            <h3 className="text-sm sm:text-xl font-black leading-tight line-clamp-2">{ticket.title}</h3>
                                            <p className="hidden sm:block text-sm text-slate-300 mt-2 line-clamp-2 opacity-80">{ticket.description}</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ====== ALL EVENTS ====== */}
                <section className="px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white">Semua Event</h2>
                            <p className="text-slate-500 text-sm mt-1">{tickets.length} event tersedia sesuai filter</p>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent" />
                        <span className="text-xs font-mono text-purple-500/60 uppercase tracking-widest">ALL_EVENTS</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="relative w-14 h-14">
                                <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                                <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin" style={{ animationDirection: 'reverse' }} />
                            </div>
                        </div>
                    ) : tickets.length > 0 ? (
                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                            {tickets.map((ticket, index) => (
                                <Link to={`/ticket/${ticket.id}`} key={ticket.id} className="group">
                                    <motion.article
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ delay: index * 0.04 }}
                                        className="overflow-hidden rounded-xl transition-all duration-300"
                                        style={{
                                            background: 'rgba(6,15,35,0.8)',
                                            border: '1px solid rgba(14,165,233,0.12)',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                        }}
                                        whileHover={{
                                            borderColor: 'rgba(14,165,233,0.3)',
                                            boxShadow: '0 8px 30px rgba(0,0,0,0.4), 0 0 20px rgba(14,165,233,0.08)',
                                            y: -4,
                                        }}
                                    >
                                        <div className="aspect-[4/3] relative overflow-hidden" style={{ background: '#0a1628' }}>
                                            {ticket.image ? (
                                                <img src={ticket.image.startsWith('http') ? ticket.image : `${API_BASE}/storage/${ticket.image}`} alt={ticket.title}
                                                    className="absolute inset-0 w-full h-full object-cover opacity-70 transition-all duration-500 group-hover:scale-105 group-hover:opacity-85" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                                            )}

                                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide"
                                                    style={{ background: 'rgba(14,165,233,0.7)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                                                    {ticket.category || 'General'}
                                                </span>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${statusStyle[ticket.status] || statusStyle.published}`}
                                                    style={{ backdropFilter: 'blur(4px)' }}>
                                                    {statusLabel[ticket.status] || ticket.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 sm:p-4">
                                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 font-mono">
                                                <span>{ticket.city || 'Online'}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span>{new Date(ticket.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>

                                            <h3 className="text-sm sm:text-base font-bold text-slate-200 leading-tight group-hover:text-cyan-300 transition-colors line-clamp-2">
                                                {ticket.title}
                                            </h3>
                                            <p className="text-slate-500 text-xs mt-1 line-clamp-2 min-h-[1.5rem]">{ticket.description}</p>

                                            <div className="mt-3 sm:mt-4 flex items-end justify-between pt-3"
                                                style={{ borderTop: '1px solid rgba(14,165,233,0.08)' }}>
                                                <div>
                                                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Dari</p>
                                                    <p className="text-sm sm:text-lg font-black text-white">{formatPrice(ticket.price)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wide">Slot</p>
                                                    <p className="text-xs sm:text-sm font-bold text-slate-300">{ticket.quota}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 rounded-xl"
                            style={{ background: 'rgba(6,15,35,0.6)', border: '1px solid rgba(14,165,233,0.1)' }}>
                            <div className="text-4xl mb-4 opacity-30">🔍</div>
                            <h3 className="text-xl font-black text-slate-200">Event tidak ditemukan</h3>
                            <p className="text-slate-500 text-sm mt-2">Coba ubah filter atau kata kunci pencarian</p>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
}
