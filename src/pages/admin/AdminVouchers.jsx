import { useEffect, useState } from 'react';
import api from '../../utils/api';
import {
    LoadingScreen,
    Pill,
    PrimaryButton,
    SectionIntro,
    SurfaceCard,
} from '../../components/TixUI';
import { showError, showSuccess, showToast } from '../../utils/swal';

const emptyVoucher = {
    code: '', description: '', discount_type: 'percent', value: '',
    min_purchase: '', max_uses: '', is_active: true,
};

export default function AdminVouchers() {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voucherSaving, setVoucherSaving] = useState(false);
    const [voucherData, setVoucherData] = useState(emptyVoucher);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/vouchers');
            setVouchers(response.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

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
            await fetchVouchers();
            showSuccess('Berhasil!', 'Voucher promo baru telah dibuat.');
        } catch (error) {
            showError('Gagal Membuat', error.response?.data?.message || 'Failed to create voucher');
        } finally {
            setVoucherSaving(false);
        }
    };

    const handleToggleVoucher = async (voucher) => {
        try {
            await api.patch(`/admin/vouchers/${voucher.id}`, { is_active: !voucher.is_active });
            await fetchVouchers();
            showToast('Status voucher diperbarui', 'success');
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Gagal memperbarui status voucher';
            showError('Gagal Update', `Detail: ${msg}`);
        }
    };

    const handleDeleteVoucher = async (id) => {
        try {
            const result = await api.delete(`/admin/vouchers/${id}`);
            await fetchVouchers();
            showSuccess('Dihapus', 'Voucher telah dihapus permanent.');
        } catch (error) {
            showError('Gagal Hapus', error.response?.data?.message || 'Gagal menghapus voucher');
        }
    };

    if (loading) return <LoadingScreen label="Memuat data voucher..." />;

    return (
        <div className="animate-float-up">
            <header className="mb-10 text-center sm:text-left">
                <SectionIntro
                    eyebrow="Rewards"
                    title="Voucher & Promo"
                    description="Buat kode promo baru atau matikan kampanye yang sudah berakhir."
                />
            </header>

            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <SurfaceCard className="h-fit p-6 sm:p-8">
                    <SectionIntro eyebrow="Builder" title="Buat Promo Baru" />
                    <form onSubmit={handleCreateVoucher} className="mt-8 grid gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Voucher Code</label>
                            <input value={voucherData.code} onChange={(e) => setVoucherData((prev) => ({ ...prev, code: e.target.value }))} placeholder="CONTOH: PROMO10" className="cyber-input rounded-2xl px-5 py-3.5 text-sm font-bold" required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Description</label>
                            <input value={voucherData.description} onChange={(e) => setVoucherData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Potongan 10% untuk tiket VIP" className="cyber-input rounded-2xl px-5 py-3.5 text-sm" required />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Type</label>
                                <select value={voucherData.discount_type} onChange={(e) => setVoucherData((prev) => ({ ...prev, discount_type: e.target.value }))} className="cyber-input rounded-2xl px-5 py-3.5 text-sm font-bold">
                                    <option value="percent">Persen (%)</option>
                                    <option value="flat">Nominal (Rp)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Value</label>
                                <input type="number" min="0" value={voucherData.value} onChange={(e) => setVoucherData((prev) => ({ ...prev, value: e.target.value }))} placeholder="10" className="cyber-input rounded-2xl px-5 py-3.5 text-sm font-bold" required />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Min. Purchase</label>
                                <input type="number" min="0" value={voucherData.min_purchase} onChange={(e) => setVoucherData((prev) => ({ ...prev, min_purchase: e.target.value }))} placeholder="0" className="cyber-input rounded-2xl px-5 py-3.5 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-navy)]">Usage Limit</label>
                                <input type="number" min="1" value={voucherData.max_uses} onChange={(e) => setVoucherData((prev) => ({ ...prev, max_uses: e.target.value }))} placeholder="Tanpa Batas" className="cyber-input rounded-2xl px-5 py-3.5 text-sm" />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl bg-[rgba(13,43,87,0.03)] px-5 py-3 text-xs font-bold text-[var(--brand-navy)]">
                            <input type="checkbox" checked={voucherData.is_active} onChange={(e) => setVoucherData((prev) => ({ ...prev, is_active: e.target.checked }))} className="h-4 w-4 rounded-md" />
                            Aktifkan segera setelah disimpan
                        </label>

                        <PrimaryButton type="submit" disabled={voucherSaving} className="mt-2 w-full">
                            {voucherSaving ? 'Sedang menyimpan...' : 'Generate Voucher'}
                        </PrimaryButton>
                    </form>
                </SurfaceCard>

                <div className="space-y-6">
                    <SurfaceCard className="p-6 sm:p-8">
                        <SectionIntro eyebrow="Management" title="Daftar Promo Aktif" />
                        <div className="mt-8 overflow-hidden rounded-2xl border border-[rgba(13,43,87,0.08)] bg-[rgba(13,43,87,0.02)]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white border-b border-[rgba(13,43,87,0.08)]">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-navy)]">Code</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-navy)]">Details</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-navy)]">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-navy)]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgba(13,43,87,0.06)]">
                                    {vouchers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-[var(--text-muted)] italic">
                                                Belum ada voucher yang dibuat.
                                            </td>
                                        </tr>
                                    )}
                                    {vouchers.map((v) => (
                                        <tr key={v.id} className="transition hover:bg-white group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-[var(--brand-navy)]">{v.code}</span>
                                                    <span className="mt-1 text-[10px] text-[var(--text-muted)]">ID: #{v.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-[var(--brand-navy)]">{v.description}</p>
                                                <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)]">
                                                    <span>Used: {v.used_count || 0}</span>
                                                    <span>•</span>
                                                    <span>Max: {v.max_uses || '∞'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleVoucher(v)}
                                                        className="group flex flex-col items-center gap-2"
                                                    >
                                                        <div className={`relative h-4 w-7 rounded-full p-0.5 transition-colors duration-300 ${v.is_active ? 'bg-[var(--brand-gold)]' : 'bg-slate-200'}`}>
                                                            <div className={`h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${v.is_active ? 'translate-x-3' : 'translate-x-0'}`} />
                                                        </div>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleDeleteVoucher(v.id)}
                                                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    title="Delete Voucher"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SurfaceCard>
                </div>
            </div>
        </div>
    );
}
