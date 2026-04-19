import { useEffect, useState } from 'react';
import api from '../../utils/api';
import {
    LoadingScreen,
    Pill,
    SectionIntro,
    SurfaceCard,
} from '../../components/TixUI';
import { showError, showToast } from '../../utils/swal';

export default function AdminPayments() {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPaymentMethods = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/payment-methods');
            setPaymentMethods(response.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const handleTogglePaymentMethod = async (method) => {
        try {
            const response = await api.patch(`/admin/payment-methods/${method.id}`, { is_active: !method.is_active });
            setPaymentMethods((prev) =>
                prev.map((item) => (item.id === method.id ? response.data.payment_method : item))
            );
            showToast('Status berhasil diubah', 'success');
        } catch (error) {
            showError('Gagal Update', 'Gagal memperbarui metode pembayaran');
        }
    };

    if (loading) return <LoadingScreen label="Memuat gateway pembayaran..." />;

    return (
        <div className="animate-float-up">
            <header className="mb-10 text-center">
                <SectionIntro 
                    eyebrow="Configuration" 
                    title="Payment Methods" 
                    description="Kelola saluran pembayaran yang tersedia untuk pelanggan Anda. Nonaktifkan metode yang sedang dalam pemeliharaan."
                />
            </header>

            <div className="mx-auto max-w-4xl">
                <SurfaceCard className="p-6 sm:p-10">
                    <div className="grid gap-6">
                        {paymentMethods.length === 0 && (
                            <div className="py-12 text-center text-[var(--text-muted)] italic">
                                Belum ada metode pembayaran yang dikonfigurasi.
                            </div>
                        )}
                        {paymentMethods.map((method) => (
                            <div key={method.id} className="flex flex-col gap-4 rounded-2xl border border-[rgba(13,43,87,0.06)] bg-[rgba(13,43,87,0.02)] p-6 transition-all duration-300 hover:border-[rgba(13,43,87,0.12)] hover:bg-white hover:shadow-[0_15px_40px_rgba(16,39,74,0.05)] sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`group/logo relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 bg-white transition-all duration-500 ${method.is_active ? 'border-[rgba(216,166,70,0.15)] shadow-[0_8px_20px_rgba(13,43,87,0.04)]' : 'border-slate-100 opacity-60 grayscale'}`}>
                                        {method.logo_url ? (
                                            <img 
                                                src={method.logo_url} 
                                                alt={method.name} 
                                                className="h-10 w-10 object-contain transition-transform duration-500 group-hover/logo:scale-110"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <span 
                                            className="text-xl font-black text-[var(--brand-navy)]"
                                            style={{ display: method.logo_url ? 'none' : 'flex' }}
                                        >
                                            {method.name.charAt(0)}
                                        </span>
                                        
                                        {/* Subtle overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[rgba(216,166,70,0.05)] pointer-events-none" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black tracking-tight text-[var(--brand-navy)]">{method.name}</h3>
                                            {method.is_active && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)] max-w-md">{method.description}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    type="button" 
                                    onClick={() => handleTogglePaymentMethod(method)}
                                    className="group flex items-center gap-3 self-end sm:self-center"
                                >
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--brand-navy)]">
                                        Status:
                                    </span>
                                    <Pill tone={method.is_active ? 'green' : 'gray'}>
                                        {method.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Pill>
                                    <div className={`relative h-6 w-11 rounded-full p-1 transition-colors duration-300 ${method.is_active ? 'bg-[var(--brand-gold)]' : 'bg-slate-200'}`}>
                                        <div className={`h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${method.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 rounded-2xl bg-[rgba(216,166,70,0.08)] p-6">
                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy)]">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-extrabold text-[var(--brand-navy)]">Informasi Sinkronisasi</p>
                                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                                    Metode pembayaran ini terhubung langsung ke gateway Midtrans Anda. Pastikan API Keys di server akurat agar transaksi tidak terganggu.
                                </p>
                            </div>
                        </div>
                    </div>
                </SurfaceCard>
            </div>
        </div>
    );
}
