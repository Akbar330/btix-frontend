import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import api, { asArray } from '../../utils/api';
import {
    LoadingScreen,
    MotionDiv,
    Pill,
    PrimaryButton,
    SectionIntro,
    SecondaryButton,
    SurfaceCard,
} from '../../components/TixUI';
import { showError, showConfirm, showSuccess } from '../../utils/swal';

const API_BASE = '';

const emptyEvent = {
    id: '', title: '', category: '', description: '', price: '', quota: '',
    event_date: '', status: 'draft', venue: '', city: '', organizer: '',
    highlights: '', terms: '',
};

export default function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchEvent, setSearchEvent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(emptyEvent);
    const fileInputRef = useRef(null);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tickets', { params: { upcoming_only: false } });
            setTickets(asArray(response.data));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter((ticket) =>
        [ticket.title, ticket.city, ticket.category].some((value) =>
            String(value || '').toLowerCase().includes(searchEvent.toLowerCase())
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
            ['title', 'category', 'description', 'price', 'quota', 'event_date', 'status', 'venue', 'city', 'organizer', 'highlights', 'terms'].forEach((key) => {
                data.append(key, formData[key] ?? '');
            });
            if (imageFile) data.append('image', imageFile);

            if (editMode) {
                await api.post(`/tickets/${formData.id}/update`, data, { headers: { 'Content-Type': undefined } });
            } else {
                await api.post('/tickets', data, { headers: { 'Content-Type': undefined } });
            }

            setShowModal(false);
            setFormData(emptyEvent);
            await fetchTickets();
            showSuccess('Berhasil!', editMode ? 'Data event telah diperbarui.' : 'Event baru telah dipublikasikan.');
        } catch (error) {
            showError('Gagal Menyimpan', error.response?.data?.message || 'Failed to save event');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await showConfirm('Hapus Event?', 'Tindakan ini tidak dapat dibatalkan.');
        if (result.isConfirmed) {
            await api.delete(`/tickets/${id}`);
            await fetchTickets();
            showSuccess('Terhapus', 'Event telah dihapus dari sistem.');
        }
    };

    if (loading) return <LoadingScreen label="Memuat daftar event..." />;

    return (
        <>
            <div className="animate-float-up">
                <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <SectionIntro 
                        eyebrow="Management" 
                        title="Events & Tickets" 
                        description="Kelola tiket pertunjukan, workshop, dan event lainnya di sini."
                    />
                    <PrimaryButton type="button" onClick={() => openModal()} className="sm:w-fit">
                        + Create Event
                    </PrimaryButton>
                </header>

                <SurfaceCard className="p-6 sm:p-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <input 
                            value={searchEvent} 
                            onChange={(e) => setSearchEvent(e.target.value)} 
                            placeholder="Cari event, kota, atau kategori..." 
                            className="cyber-input max-w-md rounded-2xl px-5 py-3.5 text-sm" 
                        />
                        <Pill tone="navy">{filteredTickets.length} Total Events</Pill>
                    </div>

                    <div className="grid gap-5">
                        {filteredTickets.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-sm font-bold text-[var(--text-muted)]">Event tidak ditemukan</p>
                            </div>
                        )}
                        {filteredTickets.map((ticket) => (
                            <div key={ticket.id} className="group relative rounded-2xl border border-[rgba(13,43,87,0.06)] bg-[rgba(13,43,87,0.02)] p-4 transition-all duration-300 hover:border-[rgba(13,43,87,0.12)] hover:bg-white hover:shadow-[0_12px_35px_rgba(16,39,74,0.04)]">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex gap-5">
                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm">
                                            {ticket.image ? (
                                                <img src={`${API_BASE}/storage/${ticket.image}`} alt={ticket.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-50 text-[10px] text-slate-300">NO IMG</div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap gap-2">
                                                <Pill tone="navy">{ticket.category || 'General'}</Pill>
                                                <Pill tone={ticket.status === 'published' ? 'green' : ticket.status === 'sold_out' ? 'red' : ticket.status === 'ended' ? 'gold' : 'gray'}>
                                                    {ticket.status}
                                                </Pill>
                                            </div>
                                            <h3 className="mt-3 truncate text-lg font-extrabold text-[var(--brand-navy)]">{ticket.title}</h3>
                                            <p className="mt-1 flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                                                <span>{ticket.city || 'TBA'}</span>
                                                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                                <span>{ticket.venue || 'Venue TBA'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(13,43,87,0.06)] pt-4 lg:border-0 lg:pt-0">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-gold)]">Price & Quota</p>
                                            <div className="flex items-center gap-3">
                                                <span className="font-extrabold text-[var(--brand-navy)] text-lg">Rp {Number(ticket.price).toLocaleString('id-ID')}</span>
                                                <span className="rounded-full bg-[rgba(13,43,87,0.05)] px-2.5 py-1 text-[11px] font-extrabold text-[var(--brand-navy)]">{ticket.quota} Slot</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openModal(ticket)}
                                                className="p-2.5 rounded-xl text-[var(--brand-gold)] hover:bg-[rgba(216,166,70,0.08)] transition-colors"
                                                title="Edit Event"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(ticket.id)}
                                                className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                                                title="Hapus Event"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SurfaceCard>
            </div>

            {/* Event Modal - Outside the transform context using Portal */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <MotionDiv initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_40px_100px_rgba(0,0,0,0.4)] sm:p-10">
                        <form onSubmit={handleSaveTicket} className="grid gap-8">
                            <SectionIntro 
                                eyebrow={editMode ? 'Update Event' : 'New Event'} 
                                title={editMode ? 'Edit Informasi Event' : 'Tambah Event Baru'} 
                                description="Pastikan data yang dimasukkan akurat untuk mempermudah calon pembeli."
                            />

                            <div className="grid gap-8 lg:grid-cols-2">
                                <div className="space-y-6">
                                    <div onClick={() => fileInputRef.current?.click()} className="group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[rgba(13,43,87,0.12)] bg-slate-50 transition-colors hover:border-[var(--brand-gold)] hover:bg-white">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="text-center">
                                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--brand-gold)] shadow-sm">
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">Upload Poster</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">Ganti Gambar</span>
                                        </div>
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); } }} />

                                    <div className="grid gap-4">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Description</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Ceritakan detail event Anda..." className="cyber-input min-h-[160px] rounded-2xl px-5 py-4 text-sm leading-relaxed" required />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Title</label>
                                            <input value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder="Nama Event" className="cyber-input rounded-xl px-4 py-3 text-sm font-bold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Category</label>
                                            <input value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} placeholder="e.g. Workshop" className="cyber-input rounded-xl px-4 py-3 text-sm" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Price (Rp)</label>
                                            <input type="number" min="0" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} placeholder="0" className="cyber-input rounded-xl px-4 py-3 text-sm font-bold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Quota</label>
                                            <input type="number" min="0" value={formData.quota} onChange={(e) => setFormData((prev) => ({ ...prev, quota: e.target.value }))} placeholder="100" className="cyber-input rounded-xl px-4 py-3 text-sm font-bold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Status</label>
                                            <select value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))} className="cyber-input rounded-xl px-4 py-3 text-sm font-bold">
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                                <option value="sold_out">Sold Out</option>
                                                <option value="ended">Ended</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Event Date</label>
                                            <input type="datetime-local" value={formData.event_date} onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))} className="cyber-input rounded-xl px-4 py-3 text-sm font-bold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Organizer</label>
                                            <input value={formData.organizer} onChange={(e) => setFormData((prev) => ({ ...prev, organizer: e.target.value }))} placeholder="Nama Penyelenggara" className="cyber-input rounded-xl px-4 py-3 text-sm" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">City</label>
                                            <input value={formData.city} onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))} placeholder="Jakarta" className="cyber-input rounded-xl px-4 py-3 text-sm font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Venue</label>
                                            <input value={formData.venue} onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))} placeholder="Grand Ballroom" className="cyber-input rounded-xl px-4 py-3 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Highlights (Satu per baris)</label>
                                    <textarea value={formData.highlights} onChange={(e) => setFormData((prev) => ({ ...prev, highlights: e.target.value }))} placeholder="Guest Star: Tulus&#10;Free Merchandise&#10;VVIP Access" className="cyber-input min-h-[90px] rounded-2xl px-5 py-3 text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Terms (Satu per baris)</label>
                                    <textarea value={formData.terms} onChange={(e) => setFormData((prev) => ({ ...prev, terms: e.target.value }))} placeholder="Tidak boleh bawa kamera&#10;Anak di bawah 5 tahun gratis" className="cyber-input min-h-[90px] rounded-2xl px-5 py-3 text-sm" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 border-t border-[rgba(13,43,87,0.08)] pt-8 sm:flex-row sm:justify-end">
                                <SecondaryButton type="button" onClick={() => setShowModal(false)} className="sm:px-10">
                                    Batalkan
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={saving} className="sm:px-12">
                                    {saving ? 'Proses penyimpanan...' : editMode ? 'Simpan Perubahan' : 'Publish Event'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </MotionDiv>
                </div>,
                document.body
            )}
        </>
    );
}
