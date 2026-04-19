import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { asObject } from '../utils/api';
import {
    EmptyState,
    InfoTile,
    LoadingScreen,
    PageHero,
    Pill,
    PrimaryButton,
    SectionIntro,
    FlatCard,
} from '../components/TixUI';

const API_BASE = '';

const statusConfig = {
    draft: { label: 'Draft', tone: 'gray' },
    published: { label: 'Now Showing', tone: 'green' },
    sold_out: { label: 'Sold Out', tone: 'red' },
    ended: { label: 'Ended', tone: 'gold' },
};

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await api.get(`/tickets/${id}`);
                setTicket(asObject(response.data, ['ticket', 'event']));
            } catch (error) {
                console.error('Failed to fetch ticket', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id]);

    const highlights = useMemo(
        () =>
            String(ticket?.highlights || '')
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean),
        [ticket]
    );

    const terms = useMemo(
        () =>
            String(ticket?.terms || '')
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean),
        [ticket]
    );

    if (loading) return <LoadingScreen label="Memuat detail event..." />;

    if (!ticket) {
        return (
            <div className="page-shell min-h-screen">
                
                <div className="tix-container pt-36 pb-20">
                    <EmptyState
                        eyebrow="Not Found"
                        title="Event Tidak Ditemukan"
                        description="Event yang kamu buka mungkin sudah dihapus atau tautannya sudah tidak berlaku."
                        action={
                            <Link to="/" className="tix-pill-button px-7 py-4 text-sm">
                                Kembali Ke Beranda
                            </Link>
                        }
                    />
                </div>
            </div>
        );
    }

    const status = statusConfig[ticket.status] || statusConfig.published;
    const imageUrl = ticket.image ? `${API_BASE}/storage/${ticket.image}` : null;
    const canCheckout = ticket.status === 'published' && ticket.quota > 0;

    return (
        <div className="page-shell min-h-screen">
            

            <PageHero
                eyebrow={ticket.category || 'Movie Event'}
                title={ticket.title}
                description={ticket.description}
                actions={
                    <>
                        <Link to="/" className="cyber-btn rounded-2xl border border-[rgba(13,43,87,0.10)] bg-white px-6 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)]">
                            Kembali
                        </Link>
                        {canCheckout && (
                            <PrimaryButton type="button" onClick={() => navigate(`/checkout/${ticket.id}`)}>
                                Beli Tiket
                            </PrimaryButton>
                        )}
                    </>
                }
            />

            <main className="tix-container pb-20">
                <section className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <FlatCard className="overflow-hidden">
                        <div className="relative aspect-[4/3] overflow-hidden bg-[rgba(13,43,87,0.08)]">
                            {imageUrl ? (
                                <img src={imageUrl} alt={ticket.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-[linear-gradient(135deg,#b6cae2,#e8bf66)]" />
                            )}
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,34,67,0.08)_0%,rgba(9,34,67,0.72)_100%)]" />
                            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                                <Pill tone="gold">{ticket.category || 'General'}</Pill>
                                <Pill tone={status.tone}>{status.label}</Pill>
                            </div>
                        </div>

                        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                            <InfoTile
                                label="Tanggal"
                                value={new Date(ticket.event_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                                subtle
                            />
                            <InfoTile
                                label="Lokasi"
                                value={[ticket.venue, ticket.city].filter(Boolean).join(', ') || 'TBA'}
                            />
                            <InfoTile label="Organizer" value={ticket.organizer || 'BANGSA TIX.ID'} subtle />
                            <InfoTile label="Kuota" value={`${ticket.quota} tiket`} />
                        </div>
                    </FlatCard>

                    <div className="grid gap-6">
                        <FlatCard className="p-6 sm:p-8">
                            <SectionIntro
                                eyebrow="Event Overview"
                                title="Informasi Utama"
                                description="Detail penting event saya susun ulang dengan style editorial yang lebih dekat dengan referensi screenshot."
                            />

                            <div className="mt-8 grid gap-4">
                                <div className="rounded-2xl bg-[rgba(216,166,70,0.10)] px-5 py-5">
                                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#8a6827]">
                                        Harga Mulai
                                    </p>
                                    <p className="mt-2 font-sans text-4xl font-extrabold uppercase text-[var(--brand-navy)]">
                                        Rp {Number(ticket.price).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-[rgba(13,43,87,0.04)] px-5 py-5 text-sm leading-7 text-[var(--text-muted)]">
                                    {canCheckout
                                        ? 'Tiket masih tersedia dan dapat langsung dipesan.'
                                        : ticket.quota <= 0
                                            ? 'Kuota tiket saat ini habis.'
                                            : 'Event belum tersedia untuk checkout.'}
                                </div>
                            </div>

                            {canCheckout && (
                                <div className="mt-6">
                                    <PrimaryButton type="button" onClick={() => navigate(`/checkout/${ticket.id}`)} className="w-full">
                                        Lanjut Ke Checkout
                                    </PrimaryButton>
                                </div>
                            )}
                        </FlatCard>

                        {highlights.length > 0 && (
                            <FlatCard className="p-6 sm:p-8">
                                <SectionIntro eyebrow="Highlights" title="Kenapa Menarik" />
                                <div className="mt-6 grid gap-3">
                                    {highlights.map((item, index) => (
                                        <div key={index} className="rounded-2xl bg-[rgba(13,43,87,0.04)] px-4 py-4 text-sm font-semibold leading-7 text-[var(--brand-navy)]">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </FlatCard>
                        )}

                        {terms.length > 0 && (
                            <FlatCard className="p-6 sm:p-8">
                                <SectionIntro eyebrow="Terms" title="Syarat Dan Ketentuan" />
                                <div className="mt-6 grid gap-3">
                                    {terms.map((item, index) => (
                                        <div key={index} className="rounded-2xl bg-[rgba(13,43,87,0.04)] px-4 py-4 text-sm leading-7 text-[var(--text-muted)]">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </FlatCard>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
