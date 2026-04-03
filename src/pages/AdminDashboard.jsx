import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import api, { asArray } from '../utils/api';
import Navbar from '../components/Navbar';

const API_BASE = '';
const inputClass = 'w-full rounded-2xl border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500';
const emptyEvent = { id: '', title: '', category: '', description: '', price: '', quota: '', event_date: '', status: 'draft', venue: '', city: '', organizer: '', highlights: '', terms: '' };
const emptyVoucher = { code: '', description: '', discount_type: 'percent', value: '', min_purchase: '', max_uses: '', is_active: true };

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
        [ticket.title, ticket.city, ticket.category].some((value) => String(value || '').toLowerCase().includes(searchEvent.toLowerCase()))
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
            ['title', 'category', 'description', 'price', 'quota', 'event_date', 'status', 'venue', 'city', 'organizer', 'highlights', 'terms'].forEach((key) => data.append(key, formData[key] ?? ''));
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
        return <div className="min-h-screen bg-gray-900"><Navbar /><div className="absolute inset-0 flex items-center justify-center"><div className="w-16 h-16 border-4 border-gray-700 border-t-amber-500 rounded-full animate-spin" /></div></div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 relative overflow-hidden font-sans">
            <Navbar />
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[500px] bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-display font-black text-white">Admin Terminal</h1>
                        <p className="text-gray-400 mt-2">Analytics, voucher, status event, dan kontrol pembayaran sekarang jadi satu paket.</p>
                    </div>
                    <button onClick={() => openModal()} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black">Create Event</button>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                    <Stat label="Revenue" value={`Rp ${Number(analytics?.overview?.revenue || 0).toLocaleString('id-ID')}`} />
                    <Stat label="Tickets Sold" value={String(analytics?.overview?.tickets_sold || 0)} />
                    <Stat label="Active Events" value={String(analytics?.overview?.active_events || 0)} />
                    <Stat label="Users" value={String(analytics?.overview?.registered_users || 0)} />
                </div>

                <div className="grid xl:grid-cols-[1.2fr,0.8fr] gap-8 mb-10">
                    <Panel title="Event Performance" subtitle="Event dengan revenue tertinggi">
                        <div className="space-y-3">
                            {(analytics?.sales_by_event || []).map((item) => (
                                <div key={item.ticket_id} className="rounded-2xl border border-gray-700 bg-gray-800/50 p-4 flex justify-between gap-4">
                                    <div><p className="font-black text-white">{item.ticket?.title}</p><p className="text-sm text-gray-400">{item.total_quantity} tiket</p></div>
                                    <p className="font-black text-white">Rp {Number(item.total_revenue).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Payment Methods" subtitle="Aktif/nonaktifkan gateway tertentu">
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div key={method.id} className="rounded-2xl border border-gray-700 bg-gray-800/50 p-4 flex justify-between gap-4">
                                    <div><p className="font-black text-white">{method.name}</p><p className="text-sm text-gray-400">{method.description}</p></div>
                                    <button onClick={() => handleTogglePaymentMethod(method)} className={`px-4 py-2 rounded-full text-xs font-black border ${method.is_active ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/60' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>{method.is_active ? 'Aktif' : 'Nonaktif'}</button>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>

                <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-8 mb-10">
                    <Panel title="Manage Events" subtitle="Cari, edit, dan kelola status event">
                        <input value={searchEvent} onChange={(e) => setSearchEvent(e.target.value)} placeholder="Cari event, kota, kategori..." className={`${inputClass} mb-5`} />
                        <div className="space-y-4">
                            {filteredTickets.map((ticket) => (
                                <div key={ticket.id} className="rounded-[1.75rem] border border-gray-700 bg-gray-800/50 p-5 shadow-sm">
                                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                                        <div className="flex gap-4 min-w-0">
                                            <div className="w-16 h-16 rounded-2xl bg-gray-700 overflow-hidden">{ticket.image ? <img src={`${API_BASE}/storage/${ticket.image}`} alt={ticket.title} className="w-full h-full object-cover" /> : null}</div>
                                            <div className="min-w-0">
                                                <div className="flex gap-2 flex-wrap mb-2"><Badge>{ticket.category || 'General'}</Badge><Badge tone={ticket.status === 'sold_out' ? 'rose' : ticket.status === 'draft' ? 'slate' : 'emerald'}>{ticket.status}</Badge></div>
                                                <p className="text-xl font-display font-black text-white truncate">{ticket.title}</p>
                                                <p className="text-sm text-gray-400">{ticket.city || 'TBA'} • {ticket.venue || 'Venue TBA'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-black text-white">Rp {Number(ticket.price).toLocaleString('id-ID')}</span>
                                            <span className="text-sm text-gray-400">{ticket.quota} quota</span>
                                            <button onClick={() => openModal(ticket)} className="px-4 py-2 rounded-xl bg-amber-500/30 text-amber-300 font-black text-sm border border-amber-500/60">Edit</button>
                                            <button onClick={() => handleDelete(ticket.id)} className="px-4 py-2 rounded-xl bg-red-500/30 text-red-400 font-black text-sm border border-red-500/60">Hapus</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <div className="space-y-8">
                        <Panel title="Voucher Builder" subtitle="Tambah promo untuk mendorong conversion">
                            <form onSubmit={handleCreateVoucher} className="space-y-4">
                                <input value={voucherData.code} onChange={(e) => setVoucherData((prev) => ({ ...prev, code: e.target.value }))} placeholder="Code" className={inputClass} required />
                                <input value={voucherData.description} onChange={(e) => setVoucherData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className={inputClass} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={voucherData.discount_type} onChange={(e) => setVoucherData((prev) => ({ ...prev, discount_type: e.target.value }))} className={inputClass}><option value="percent">Percent</option><option value="flat">Flat</option></select>
                                    <input type="number" min="0" value={voucherData.value} onChange={(e) => setVoucherData((prev) => ({ ...prev, value: e.target.value }))} placeholder="Value" className={inputClass} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" min="0" value={voucherData.min_purchase} onChange={(e) => setVoucherData((prev) => ({ ...prev, min_purchase: e.target.value }))} placeholder="Min purchase" className={inputClass} />
                                    <input type="number" min="1" value={voucherData.max_uses} onChange={(e) => setVoucherData((prev) => ({ ...prev, max_uses: e.target.value }))} placeholder="Max uses" className={inputClass} />
                                </div>
                                <label className="inline-flex items-center gap-3 text-sm font-bold text-white"><input type="checkbox" checked={voucherData.is_active} onChange={(e) => setVoucherData((prev) => ({ ...prev, is_active: e.target.checked }))} />Active sekarang</label>
                                <button type="submit" disabled={voucherSaving} className="w-full rounded-2xl bg-amber-500 text-black py-3 font-black">{voucherSaving ? 'Saving...' : 'Simpan Voucher'}</button>
                            </form>
                        </Panel>
                        <Panel title="Voucher Library" subtitle="Promo yang sudah dibuat">
                            <div className="space-y-3">
                                {vouchers.map((voucher) => (
                                    <div key={voucher.id} className="rounded-2xl border border-gray-700 bg-gray-800/50 p-4">
                                        <div className="flex justify-between gap-3"><div><p className="font-black text-white">{voucher.code}</p><p className="text-sm text-gray-400">{voucher.description}</p></div><Badge tone={voucher.is_active ? 'emerald' : 'slate'}>{voucher.is_active ? 'active' : 'inactive'}</Badge></div>
                                        <p className="mt-3 text-sm text-gray-400">Used: <span className="font-black">{voucher.used_count}</span></p>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                </div>

                <Panel title="Recent Transactions" subtitle="Pantau pembayaran terbaru">
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {transactions.slice(0, 6).map((tx) => (
                            <div key={tx.id} className="rounded-2xl border border-gray-700 bg-gray-800/50 p-4">
                                <div className="flex justify-between gap-3">
                                    <div><p className="font-black text-white">{tx.user?.name}</p><p className="text-sm text-gray-400">{tx.ticket?.title}</p></div>
                                    <Badge tone={tx.payment_status === 'success' ? 'emerald' : tx.payment_status === 'pending' ? 'amber' : 'rose'}>{tx.payment_status}</Badge>
                                </div>
                                <p className="mt-3 text-sm text-gray-400 uppercase tracking-[0.2em]">{tx.payment_method_code || 'midtrans'}</p>
                                <p className="mt-1 font-black text-white">Rp {Number(tx.total_price).toLocaleString('id-ID')}</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-gray-800 border border-gray-700 p-8 shadow-2xl">
                        <form onSubmit={handleSaveTicket} className="space-y-4">
                            <h2 className="text-3xl font-display font-black text-white">{editMode ? 'Edit Event' : 'Create Event'}</h2>
                            <div onClick={() => fileInputRef.current?.click()} className="rounded-[1.75rem] border-2 border-dashed border-gray-600 bg-gray-900 cursor-pointer overflow-hidden">{imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" /> : <div className="h-52 flex items-center justify-center text-gray-400 font-bold">Klik untuk upload gambar</div>}</div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); } }} />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className={inputClass} required />
                                <input value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} placeholder="Category" className={inputClass} />
                            </div>
                            <textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className={`${inputClass} min-h-[110px]`} required />
                            <div className="grid sm:grid-cols-3 gap-4">
                                <input type="number" min="0" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} placeholder="Price" className={inputClass} required />
                                <input type="number" min="0" value={formData.quota} onChange={(e) => setFormData((prev) => ({ ...prev, quota: e.target.value }))} placeholder="Quota" className={inputClass} required />
                                <select value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))} className={inputClass}><option value="draft">draft</option><option value="published">published</option><option value="sold_out">sold_out</option><option value="ended">ended</option></select>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input type="datetime-local" value={formData.event_date} onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))} className={inputClass} required />
                                <input value={formData.organizer} onChange={(e) => setFormData((prev) => ({ ...prev, organizer: e.target.value }))} placeholder="Organizer" className={inputClass} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input value={formData.venue} onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))} placeholder="Venue" className={inputClass} />
                                <input value={formData.city} onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))} placeholder="City" className={inputClass} />
                            </div>
                            <textarea value={formData.highlights} onChange={(e) => setFormData((prev) => ({ ...prev, highlights: e.target.value }))} placeholder="Highlights (satu per baris)" className={`${inputClass} min-h-[90px]`} />
                            <textarea value={formData.terms} onChange={(e) => setFormData((prev) => ({ ...prev, terms: e.target.value }))} placeholder="Terms (satu per baris)" className={`${inputClass} min-h-[90px]`} />
                            <div className="flex flex-col-reverse sm:flex-row gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="rounded-2xl border border-gray-600 px-5 py-3 font-black text-gray-300">Cancel</button>
                                <button type="submit" disabled={saving} className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 font-black">{saving ? 'Saving...' : editMode ? 'Save Changes' : 'Publish Event'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value }) {
    return <div className="bg-gray-800/75 backdrop-blur-2xl border border-gray-700 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"><p className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">{label}</p><p className="mt-3 text-3xl font-display font-black text-white">{value}</p></div>;
}

function Panel({ title, subtitle, children }) {
    return <div className="bg-gray-800/75 backdrop-blur-2xl border border-gray-700 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.3)]"><h2 className="text-2xl font-display font-black text-white">{title}</h2><p className="text-gray-400 text-sm mt-2 mb-6">{subtitle}</p>{children}</div>;
}

function Badge({ children, tone = 'primary' }) {
    const tones = { primary: 'bg-amber-500/30 text-amber-300 border-amber-500/60', emerald: 'bg-emerald-500/30 text-emerald-400 border-emerald-500/60', rose: 'bg-red-500/30 text-red-400 border-red-500/60', amber: 'bg-amber-500/30 text-amber-300 border-amber-500/60', slate: 'bg-gray-700 text-gray-400 border-gray-600' };
    return <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-black uppercase tracking-[0.18em] ${tones[tone] || tones.primary}`}>{children}</span>;
}
