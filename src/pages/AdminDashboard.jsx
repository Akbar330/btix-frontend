import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import api, { asArray } from '../utils/api';
import Navbar from '../components/Navbar';
import MembershipPlansManager from '../components/MembershipPlansManager';

const API_BASE = '';

const cyberInputClass = [
    'w-full rounded-xl px-4 py-3 text-sm font-medium cyber-input',
].join(' ');

const emptyEvent = {
    id: '', title: '', category: '', description: '', price: '', quota: '',
    event_date: '', status: 'draft', venue: '', city: '', organizer: '',
    highlights: '', terms: '',
};

const emptyVoucher = {
    code: '', description: '', discount_type: 'percent', value: '',
    min_purchase: '', max_uses: '', is_active: true,
};

/* ── Reusable sub-components ──────────────────────────────── */

function StatCard({ label, value, icon, color = '#0ea5e9' }) {
    return (
        <div className="corner-accent relative overflow-hidden p-6 rounded-2xl"
            style={{
                background: 'rgba(6,15,35,0.82)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${color}22`,
                boxShadow: `0 0 20px ${color}0a`,
            }}>
            <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
            <p className="text-xs font-black uppercase tracking-widest mb-3 font-mono"
                style={{ color: `${color}90` }}>
                {label}
            </p>
            <div className="flex items-end justify-between gap-2">
                <p className="text-3xl font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                    {value}
                </p>
                <span className="text-2xl opacity-30">{icon}</span>
            </div>
        </div>
    );
}

function Panel({ title, subtitle, children, accentColor = 'rgba(14,165,233,0.18)' }) {
    return (
        <div className="corner-accent relative overflow-hidden rounded-2xl"
            style={{
                background: 'rgba(6,15,35,0.82)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${accentColor}`,
            }}>
            <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.35), transparent)' }} />
            <div className="p-6 sm:p-8">
                <h2 className="text-xl font-black text-white mb-1">{title}</h2>
                <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
                {children}
            </div>
        </div>
    );
}

function DarkBadge({ children, tone = 'primary' }) {
    const tones = {
        primary: { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.25)', color: '#38bdf8' },
        emerald: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#34d399' },
        rose: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#f87171' },
        amber: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24' },
        slate: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', color: '#94a3b8' },
    };
    const t = tones[tone] || tones.primary;
    return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
            style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.color }}>
            {children}
        </span>
    );
}

/* ── Main component ─────────────────────────────────────────── */

export default function AdminDashboard() {
    const [tickets, setTickets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchEvent, setSearchEvent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [voucherSaving, setVoucherSaving] = useState(false);
    const [formData, setFormData] = useState(emptyEvent);
    const [voucherData, setVoucherData] = useState(emptyVoucher);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ticketsRes, txRes, methodsRes, analyticsRes, vouchersRes] = await Promise.all([
                api.get('/tickets', { params: { upcoming_only: false } }),
                api.get('/transactions'),
                api.get('/admin/payment-methods'),
                api.get('/admin/analytics'),
                api.get('/admin/vouchers'),
            ]);
            setTickets(asArray(ticketsRes.data));
            setTransactions(asArray(txRes.data));
            setPaymentMethods(methodsRes.data || []);
            setAnalytics(analyticsRes.data);
            setVouchers(vouchersRes.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredTickets = tickets.filter((ticket) =>
        [ticket.title, ticket.city, ticket.category].some((v) =>
            String(v || '').toLowerCase().includes(searchEvent.toLowerCase())
        )
    );

    const openModal = (ticket = null) => {
        setImageFile(null);
        if (ticket) {
            setEditMode(true);
            setFormData({ ...emptyEvent, ...ticket, event_date: ticket.event_date?.slice(0, 16) || '' });
            setImagePreview(ticket.image ? `${API_BASE}/storage/${ticket.image}` : null);
        } else {
            setEditMode(false);
            setFormData(emptyEvent);
            setImagePreview(null);
        }
        setShowModal(true);
    };

    const handleSaveTicket = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            ['title', 'category', 'description', 'price', 'quota', 'event_date', 'status', 'venue', 'city', 'organizer', 'highlights', 'terms']
                .forEach((key) => data.append(key, formData[key] ?? ''));
            if (imageFile) data.append('image', imageFile);
            if (editMode) await api.post(`/tickets/${formData.id}/update`, data, { headers: { 'Content-Type': undefined } });
            else await api.post('/tickets', data, { headers: { 'Content-Type': undefined } });
            setShowModal(false);
            setFormData(emptyEvent);
            await fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save event');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus event ini?')) return;
        await api.delete(`/tickets/${id}`);
        await fetchData();
    };

    const handleTogglePaymentMethod = async (method) => {
        const response = await api.patch(`/admin/payment-methods/${method.id}`, { is_active: !method.is_active });
        setPaymentMethods((prev) => prev.map((item) => item.id === method.id ? response.data.payment_method : item));
    };

    const handleCreateVoucher = async (e) => {
        e.preventDefault();
        setVoucherSaving(true);
        try {
            await api.post('/admin/vouchers', {
                ...voucherData,
                code: voucherData.code.toUpperCase(),
                value: Number(voucherData.value),
                min_purchase: voucherData.min_purchase ? Number(voucherData.min_purchase) : 0,
                max_uses: voucherData.max_uses ? Number(voucherData.max_uses) : null,
            });
            setVoucherData(emptyVoucher);
            await fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create voucher');
        } finally {
            setVoucherSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: '#020817' }}>
                <Navbar />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"
                            style={{ boxShadow: '0 0 15px rgba(14,165,233,0.5)' }} />
                        <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin"
                            style={{ animationDirection: 'reverse' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden font-sans" style={{ background: '#020817' }}>
            {/* BG effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full opacity-12"
                    style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)', filter: 'blur(100px)' }} />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)', filter: 'blur(100px)' }} />
                <div className="absolute inset-0 cyber-grid opacity-20" />
            </div>

            <Navbar />

            <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1 h-10 rounded-full"
                                style={{ background: 'linear-gradient(180deg, #ffd700, #0ea5e9)' }} />
                            <h1 className="text-4xl font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                                ADMIN TERMINAL
                            </h1>
                        </div>
                        <p className="text-slate-500 ml-4 text-sm">Analytics, voucher, event, dan kontrol pembayaran dalam satu panel.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="cyber-btn px-6 py-3 rounded-xl text-sm font-black text-black"
                        style={{
                            background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
                            boxShadow: '0 0 20px rgba(14,165,233,0.4)',
                        }}
                    >
                        + Create Event
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                    <StatCard label="Revenue" value={`Rp ${Number(analytics?.overview?.revenue || 0).toLocaleString('id-ID')}`} icon="💰" color="#ffd700" />
                    <StatCard label="Tickets Sold" value={String(analytics?.overview?.tickets_sold || 0)} icon="🎟" color="#0ea5e9" />
                    <StatCard label="Active Events" value={String(analytics?.overview?.active_events || 0)} icon="⚡" color="#10b981" />
                    <StatCard label="Users" value={String(analytics?.overview?.registered_users || 0)} icon="👥" color="#a855f7" />
                </div>

                {/* Event Performance + Payment Methods */}
                <div className="grid xl:grid-cols-[1.2fr,0.8fr] gap-6 mb-8">
                    <Panel title="Event Performance" subtitle="Event dengan revenue tertinggi">
                        <div className="space-y-3">
                            {(analytics?.sales_by_event || []).map((item) => (
                                <div key={item.ticket_id} className="flex justify-between gap-4 p-4 rounded-xl"
                                    style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.1)' }}>
                                    <div>
                                        <p className="font-black text-slate-200">{item.ticket?.title}</p>
                                        <p className="text-sm text-slate-500 mt-0.5">{item.total_quantity} tiket terjual</p>
                                    </div>
                                    <p className="font-black text-white shrink-0">Rp {Number(item.total_revenue).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                            {(analytics?.sales_by_event || []).length === 0 && (
                                <p className="text-slate-600 text-sm font-mono text-center py-4">// No data yet</p>
                            )}
                        </div>
                    </Panel>

                    <Panel title="Payment Methods" subtitle="Aktif / nonaktifkan gateway">
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div key={method.id} className="flex justify-between gap-4 p-4 rounded-xl"
                                    style={{ background: 'rgba(6,15,35,0.6)', border: '1px solid rgba(14,165,233,0.1)' }}>
                                    <div>
                                        <p className="font-black text-slate-200">{method.name}</p>
                                        <p className="text-sm text-slate-500 mt-0.5">{method.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleTogglePaymentMethod(method)}
                                        className="cyber-btn px-4 py-1.5 rounded-full text-xs font-black shrink-0"
                                        style={method.is_active ? {
                                            background: 'rgba(16,185,129,0.12)',
                                            border: '1px solid rgba(16,185,129,0.3)',
                                            color: '#34d399',
                                        } : {
                                            background: 'rgba(100,116,139,0.1)',
                                            border: '1px solid rgba(100,116,139,0.2)',
                                            color: '#64748b',
                                        }}
                                    >
                                        {method.is_active ? '● Aktif' : '○ Nonaktif'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>

                {/* Manage Events + Voucher */}
                <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-6 mb-8">
                    <Panel title="Manage Events" subtitle="Cari, edit, dan kelola status event">
                        <input
                            value={searchEvent}
                            onChange={(e) => setSearchEvent(e.target.value)}
                            placeholder="Cari event, kota, kategori..."
                            className={`${cyberInputClass} mb-5`}
                        />
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(14,165,233,0.3) transparent' }}>
                            {filteredTickets.map((ticket) => (
                                <div key={ticket.id} className="rounded-xl p-4"
                                    style={{ background: 'rgba(6,15,35,0.6)', border: '1px solid rgba(14,165,233,0.1)' }}>
                                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                                        <div className="flex gap-4 min-w-0">
                                            {/* Thumbnail */}
                                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                                                style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
                                                {ticket.image
                                                    ? <img src={`${API_BASE}/storage/${ticket.image}`} alt={ticket.title} className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center text-slate-600 text-lg">🎟</div>}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex gap-2 flex-wrap mb-1.5">
                                                    <DarkBadge>{ticket.category || 'General'}</DarkBadge>
                                                    <DarkBadge tone={ticket.status === 'sold_out' ? 'rose' : ticket.status === 'draft' ? 'slate' : 'emerald'}>{ticket.status}</DarkBadge>
                                                </div>
                                                <p className="text-base font-black text-slate-100 truncate">{ticket.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{ticket.city || 'TBA'} · {ticket.venue || 'Venue TBA'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-white text-sm">Rp {Number(ticket.price).toLocaleString('id-ID')}</span>
                                            <span className="text-xs text-slate-500">{ticket.quota} slot</span>
                                            <button
                                                onClick={() => openModal(ticket)}
                                                className="cyber-btn px-3 py-1.5 rounded-lg text-xs font-black"
                                                style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#38bdf8' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ticket.id)}
                                                className="cyber-btn px-3 py-1.5 rounded-lg text-xs font-black"
                                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredTickets.length === 0 && (
                                <p className="text-slate-600 text-sm font-mono text-center py-8">// Tidak ada event ditemukan</p>
                            )}
                        </div>
                    </Panel>

                    <div className="space-y-6">
                        {/* Voucher Builder */}
                        <Panel title="Voucher Builder" subtitle="Tambah promo untuk mendorong conversion">
                            <form onSubmit={handleCreateVoucher} className="space-y-3">
                                <input value={voucherData.code} onChange={(e) => setVoucherData((p) => ({ ...p, code: e.target.value }))} placeholder="CODE" className={cyberInputClass} required />
                                <input value={voucherData.description} onChange={(e) => setVoucherData((p) => ({ ...p, description: e.target.value }))} placeholder="Deskripsi" className={cyberInputClass} required />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={voucherData.discount_type} onChange={(e) => setVoucherData((p) => ({ ...p, discount_type: e.target.value }))} className={cyberInputClass}
                                        style={{ background: 'rgba(2,8,23,0.7)', color: '#e2e8f0' }}>
                                        <option value="percent" style={{ background: '#060f1e' }}>Persen (%)</option>
                                        <option value="flat" style={{ background: '#060f1e' }}>Flat (Rp)</option>
                                    </select>
                                    <input type="number" min="0" value={voucherData.value} onChange={(e) => setVoucherData((p) => ({ ...p, value: e.target.value }))} placeholder="Value" className={cyberInputClass} required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" min="0" value={voucherData.min_purchase} onChange={(e) => setVoucherData((p) => ({ ...p, min_purchase: e.target.value }))} placeholder="Min purchase" className={cyberInputClass} />
                                    <input type="number" min="1" value={voucherData.max_uses} onChange={(e) => setVoucherData((p) => ({ ...p, max_uses: e.target.value }))} placeholder="Max uses" className={cyberInputClass} />
                                </div>
                                <label className="flex items-center gap-3 text-sm font-bold text-slate-400 cursor-pointer">
                                    <input type="checkbox" checked={voucherData.is_active} onChange={(e) => setVoucherData((p) => ({ ...p, is_active: e.target.checked }))}
                                        className="w-4 h-4 accent-cyan-400" />
                                    Aktif sekarang
                                </label>
                                <button type="submit" disabled={voucherSaving}
                                    className="cyber-btn w-full py-3 rounded-xl text-sm font-black text-black disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)', boxShadow: '0 0 15px rgba(14,165,233,0.3)' }}>
                                    {voucherSaving ? 'Menyimpan...' : 'Simpan Voucher'}
                                </button>
                            </form>
                        </Panel>

                        {/* Voucher Library */}
                        <Panel title="Voucher Library" subtitle="Promo yang sudah dibuat">
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {vouchers.map((voucher) => (
                                    <div key={voucher.id} className="p-4 rounded-xl"
                                        style={{ background: 'rgba(6,15,35,0.6)', border: '1px solid rgba(14,165,233,0.08)' }}>
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <p className="font-black text-slate-200 font-mono">{voucher.code}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{voucher.description}</p>
                                            </div>
                                            <DarkBadge tone={voucher.is_active ? 'emerald' : 'slate'}>
                                                {voucher.is_active ? 'active' : 'off'}
                                            </DarkBadge>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-600 font-mono">
                                            Used: <span className="text-slate-400 font-black">{voucher.used_count}</span>
                                        </p>
                                    </div>
                                ))}
                                {vouchers.length === 0 && (
                                    <p className="text-slate-600 text-sm font-mono text-center py-4">// Belum ada voucher</p>
                                )}
                            </div>
                        </Panel>
                    </div>
                </div>

                {/* Membership Plans */}
                <Panel title="Membership Plans" subtitle="Kelola fitur, harga, dan struktur paket membership" className="mb-8">
                    <MembershipPlansManager />
                </Panel>

                {/* Recent Transactions */}
                <Panel title="Recent Transactions" subtitle="Pantau pembayaran terbaru">
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {transactions.slice(0, 6).map((tx) => (
                            <div key={tx.id} className="p-4 rounded-xl"
                                style={{ background: 'rgba(6,15,35,0.6)', border: '1px solid rgba(14,165,233,0.08)' }}>
                                <div className="flex justify-between gap-3 mb-3">
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-200 truncate">{tx.user?.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate">{tx.ticket?.title}</p>
                                    </div>
                                    <DarkBadge tone={tx.payment_status === 'success' ? 'emerald' : tx.payment_status === 'pending' ? 'amber' : 'rose'}>
                                        {tx.payment_status}
                                    </DarkBadge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                                        {tx.payment_method_code || 'midtrans'}
                                    </span>
                                    <span className="font-black text-white text-sm">
                                        Rp {Number(tx.total_price).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="col-span-3 text-slate-600 text-sm font-mono text-center py-8">// Belum ada transaksi</div>
                        )}
                    </div>
                </Panel>
            </div>

            {/* ── Create/Edit Modal ────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="corner-accent relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-8"
                        style={{
                            background: 'rgba(6,15,35,0.98)',
                            backdropFilter: 'blur(30px)',
                            border: '1px solid rgba(14,165,233,0.2)',
                            boxShadow: '0 0 60px rgba(14,165,233,0.1)',
                        }}
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.6), transparent)' }} />

                        <form onSubmit={handleSaveTicket} className="space-y-4">
                            <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
                                {editMode ? '✎ EDIT EVENT' : '+ CREATE EVENT'}
                            </h2>

                            {/* Image upload */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all"
                                style={{ borderColor: 'rgba(14,165,233,0.2)', background: 'rgba(14,165,233,0.03)' }}
                            >
                                {imagePreview
                                    ? <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                                    : <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-500">
                                        <span className="text-3xl">📷</span>
                                        <span className="text-sm font-medium">Klik untuk upload gambar</span>
                                    </div>
                                }
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />

                            <div className="grid sm:grid-cols-2 gap-4">
                                <input value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className={cyberInputClass} required />
                                <input value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className={cyberInputClass} />
                            </div>
                            <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className={`${cyberInputClass} min-h-[110px] resize-y`} required />
                            <div className="grid sm:grid-cols-3 gap-4">
                                <input type="number" min="0" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} placeholder="Price" className={cyberInputClass} required />
                                <input type="number" min="0" value={formData.quota} onChange={(e) => setFormData((p) => ({ ...p, quota: e.target.value }))} placeholder="Quota" className={cyberInputClass} required />
                                <select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className={cyberInputClass}
                                    style={{ background: 'rgba(2,8,23,0.7)', color: '#e2e8f0' }}>
                                    <option value="draft" style={{ background: '#060f1e' }}>draft</option>
                                    <option value="published" style={{ background: '#060f1e' }}>published</option>
                                    <option value="sold_out" style={{ background: '#060f1e' }}>sold_out</option>
                                    <option value="ended" style={{ background: '#060f1e' }}>ended</option>
                                </select>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input type="datetime-local" value={formData.event_date} onChange={(e) => setFormData((p) => ({ ...p, event_date: e.target.value }))} className={cyberInputClass} required />
                                <input value={formData.organizer} onChange={(e) => setFormData((p) => ({ ...p, organizer: e.target.value }))} placeholder="Organizer" className={cyberInputClass} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input value={formData.venue} onChange={(e) => setFormData((p) => ({ ...p, venue: e.target.value }))} placeholder="Venue" className={cyberInputClass} />
                                <input value={formData.city} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))} placeholder="City" className={cyberInputClass} />
                            </div>
                            <textarea value={formData.highlights} onChange={(e) => setFormData((p) => ({ ...p, highlights: e.target.value }))} placeholder="Highlights (satu per baris)" className={`${cyberInputClass} min-h-[80px] resize-y`} />
                            <textarea value={formData.terms} onChange={(e) => setFormData((p) => ({ ...p, terms: e.target.value }))} placeholder="Terms (satu per baris)" className={`${cyberInputClass} min-h-[80px] resize-y`} />

                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="cyber-btn px-5 py-3 rounded-xl font-black text-sm text-slate-400"
                                    style={{ border: '1px solid rgba(100,116,139,0.25)', background: 'transparent' }}>
                                    Batal
                                </button>
                                <button type="submit" disabled={saving}
                                    className="cyber-btn flex-1 py-3 rounded-xl font-black text-sm text-black disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
                                    {saving ? 'Menyimpan...' : editMode ? 'Simpan Perubahan' : 'Publish Event'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
