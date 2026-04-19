import { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import {
    LoadingScreen,
    Pill,
    PrimaryButton,
    SectionIntro,
    SurfaceCard,
} from '../../components/TixUI';
import { showError, showConfirm, showSuccess, showToast } from '../../utils/swal';

const API_BASE = '';

export default function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bannerImage, setBannerImage] = useState(null);
    const [bannerData, setBannerData] = useState({ url: '', is_active: true });
    const [bannerSaving, setBannerSaving] = useState(false);
    const bannerInputRef = useRef(null);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/banners');
            setBanners(response.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!bannerImage) return showToast('Pilih gambar banner dulu!', 'warning');
        setBannerSaving(true);
        try {
            const data = new FormData();
            data.append('image', bannerImage);
            data.append('url', bannerData.url || '');
            data.append('is_active', bannerData.is_active ? 1 : 0);

            await api.post('/admin/banners', data, { headers: { 'Content-Type': undefined } });
            setBannerImage(null);
            setBannerData({ url: '', is_active: true });
            if (bannerInputRef.current) bannerInputRef.current.value = '';
            await fetchBanners();
            showSuccess('Berhasil!', 'Banner promo baru telah ditambahkan.');
        } catch (error) {
            showError('Gagal Upload', error.response?.data?.message || 'Failed to upload banner');
        } finally {
            setBannerSaving(false);
        }
    };

    const handleToggleBanner = async (banner) => {
        try {
            await api.patch(`/admin/banners/${banner.id}`, { is_active: !banner.is_active });
            await fetchBanners();
            showToast('Status banner diperbarui', 'success');
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Gagal memperbarui status banner';
            showError('Gagal Update', `Detail: ${msg}`);
        }
    };

    const handleDeleteBanner = async (id) => {
        const result = await showConfirm('Hapus Banner?', 'Gambar ini akan dihapus dari carousel utama.');
        if (result.isConfirmed) {
            await api.delete(`/admin/banners/${id}`);
            await fetchBanners();
            showSuccess('Dihapus', 'Banner telah dihapus.');
        }
    };

    if (loading) return <LoadingScreen label="Memuat aset promo..." />;

    return (
        <div className="animate-float-up">
            <header className="mb-10 text-center">
                <SectionIntro
                    eyebrow="Visuals"
                    title="Promotional Banners"
                    description="Kelola gambar carousel yang muncul di halaman utama untuk mempromosikan event unggulan."
                />
            </header>

            <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                <SurfaceCard className="h-fit p-6 sm:p-10">
                    <SectionIntro eyebrow="Builder" title="Upload New Banner" />
                    <form onSubmit={handleAddBanner} className="mt-8 grid gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Banner Image (16:9 Recommended)</label>
                            <div className="relative flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[rgba(13,43,87,0.12)] bg-[rgba(13,43,87,0.02)] p-6 transition hover:bg-white hover:border-[var(--brand-gold)]">
                                <input
                                    ref={bannerInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setBannerImage(e.target.files?.[0])}
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    required
                                />
                                <div className="text-center">
                                    <svg className="mx-auto h-8 w-8 text-[var(--brand-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <p className="mt-2 text-xs font-extrabold text-[var(--brand-navy)]">{bannerImage ? bannerImage.name : 'Pilih File Gambar'}</p>
                                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">PNG, JPG atau WEBP hingga 2MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Target URL (Optional)</label>
                            <input
                                value={bannerData.url}
                                onChange={(e) => setBannerData((prev) => ({ ...prev, url: e.target.value }))}
                                placeholder="https://..."
                                className="cyber-input rounded-2xl px-5 py-3.5 text-sm"
                            />
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl bg-[rgba(13,43,87,0.03)] px-5 py-3.5 text-xs font-bold text-[var(--brand-navy)]">
                            <input type="checkbox" checked={bannerData.is_active} onChange={(e) => setBannerData((prev) => ({ ...prev, is_active: e.target.checked }))} className="h-4 w-4" />
                            Publikasikan banner setelah upload
                        </label>

                        <PrimaryButton type="submit" disabled={bannerSaving} className="mt-2 w-full">
                            {bannerSaving ? 'Sedang Memproses...' : 'Upload & Aktifkan'}
                        </PrimaryButton>
                    </form>
                </SurfaceCard>

                <SurfaceCard className="p-6 sm:p-10">
                    <SectionIntro eyebrow="Active Banners" title="Manage Library" />
                    <div className="mt-8 grid gap-6 max-h-[600px] overflow-y-auto pr-2">
                        {banners.length === 0 ? (
                            <div className="py-12 text-center text-[var(--text-muted)]">Belum ada banner aktif.</div>
                        ) : null}
                        {banners.map((banner) => (
                            <div key={banner.id} className="group relative overflow-hidden rounded-2xl border border-[rgba(13,43,87,0.08)] bg-white shadow-sm transition hover:shadow-md">
                                <div className="aspect-[16/6] w-full bg-slate-100">
                                    <img src={`${API_BASE}/storage/${banner.image}`} alt="Banner" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                </div>
                                <div className="flex items-center justify-between border-t border-[rgba(13,43,87,0.06)] p-4">
                                    <div className="flex gap-4 items-center">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleBanner(banner)}
                                            className="flex items-center gap-2 group"
                                        >
                                            <div className={`relative h-5 w-9 rounded-full p-0.5 transition-colors duration-300 ${banner.is_active ? 'bg-[var(--brand-gold)]' : 'bg-slate-200'}`}>
                                                <div className={`h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${banner.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)] opacity-60 group-hover:opacity-100">
                                                {banner.is_active ? 'Active' : 'Hidden'}
                                            </span>
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteBanner(banner.id)}
                                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                        title="Remove Banner"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </SurfaceCard>
            </div>
        </div>
    );
}
