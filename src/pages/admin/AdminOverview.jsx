import { useEffect, useState } from 'react';
import api, { asArray } from '../../utils/api';
import {
    LoadingScreen,
    SectionIntro,
    SurfaceCard,
    Pill
} from '../../components/TixUI';

export default function AdminOverview() {
    const [analytics, setAnalytics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, txRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/transactions'),
            ]);
            setAnalytics(analyticsRes.data);
            setTransactions(asArray(txRes.data));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <LoadingScreen label="Memuat ringkasan data..." />;

    return (
        <div className="animate-float-up">
            <header className="mb-10">
                <SectionIntro 
                    eyebrow="Admin Overview" 
                    title="Dashboard Statistik" 
                    description="Pantau performa penjualan, revenue, dan interaksi pengguna secara real-time."
                />
            </header>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Revenue" value={`Rp ${Number(analytics?.overview?.revenue || 0).toLocaleString('id-ID')}`} />
                <StatCard label="Tickets Sold" value={String(analytics?.overview?.tickets_sold || 0)} />
                <StatCard label="Active Events" value={String(analytics?.overview?.active_events || 0)} />
                <StatCard label="Users" value={String(analytics?.overview?.registered_users || 0)} />
            </section>

            <div className="mt-12 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                <SurfaceCard className="p-6 sm:p-8">
                    <SectionIntro eyebrow="Performance" title="Event Performance" description="Event dengan penjualan dan revenue tertinggi." />
                    <div className="mt-8 grid gap-4">
                        {(analytics?.sales_by_event || []).map((item) => (
                            <div key={item.ticket_id} className="flex items-center justify-between gap-4 rounded-2xl bg-[rgba(13,43,87,0.04)] px-5 py-5 transition hover:bg-[rgba(13,43,87,0.06)]">
                                <div>
                                    <p className="font-extrabold text-[var(--brand-navy)]">{item.ticket?.title}</p>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">{item.total_quantity} tiket terjual</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-extrabold text-[var(--brand-navy)]">Rp {Number(item.total_revenue).toLocaleString('id-ID')}</p>
                                    <Pill tone="green">Success</Pill>
                                </div>
                            </div>
                        ))}
                    </div>
                </SurfaceCard>

                <SurfaceCard className="p-6 sm:p-8">
                    <SectionIntro eyebrow="Recent Activity" title="Transaksi Terakhir" />
                    <div className="mt-8 grid gap-4 text-sm">
                        {transactions.slice(0, 8).map((tx) => (
                            <div key={tx.id} className="border-b border-[rgba(13,43,87,0.06)] pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-extrabold text-[var(--brand-navy)]">{tx.user?.name}</p>
                                        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{tx.ticket?.title}</p>
                                    </div>
                                    <Pill tone={tx.payment_status === 'success' ? 'green' : tx.payment_status === 'pending' ? 'gold' : 'red'}>
                                        {tx.payment_status}
                                    </Pill>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{tx.payment_method_code || 'Midtrans'}</span>
                                    <span className="font-extrabold text-[var(--brand-navy)]">Rp {Number(tx.total_price).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SurfaceCard>
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <SurfaceCard className="p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(16,39,74,0.1)]">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-gold)]">{label}</p>
            <p className="mt-3 font-sans text-3xl font-extrabold uppercase text-[var(--brand-navy)] lg:text-4xl">{value}</p>
        </SurfaceCard>
    );
}
