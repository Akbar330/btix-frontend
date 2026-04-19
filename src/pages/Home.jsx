import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as motionLib } from 'framer-motion';
import api, { asArray } from '../utils/api';
import heroFallback from '../assets/hero.png';

const API_BASE = '';

const statusMap = {
    draft: 'Coming Soon',
    published: 'Now Showing',
    sold_out: 'Sold Out',
    ended: 'Ended',
};

const statusTone = {
    draft: 'bg-white/14 text-white border-white/20',
    published: 'bg-[rgba(216,166,70,0.22)] text-[#fff5dc] border-[rgba(232,190,99,0.46)]',
    sold_out: 'bg-[rgba(123,36,36,0.35)] text-[#ffe0dd] border-[rgba(255,195,188,0.22)]',
    ended: 'bg-[rgba(34,48,74,0.45)] text-[#d9dfeb] border-[rgba(255,255,255,0.16)]',
};

const formatPrice = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : 'Segera diumumkan';

const getImageUrl = (image) => {
    if (!image) return heroFallback;
    return image.startsWith('http') ? image : `${API_BASE}/storage/${image}`;
};

const categoriesFallback = ['Semua', 'Drama', 'Horror', 'Action', 'Family'];

function BannerCarousel({ banners }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!banners || banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners]);

    if (!banners || banners.length === 0) {
        return (
            <section className="w-full pt-[76px] flex items-center justify-center">
                <div className="h-[280px] sm:h-[400px] md:h-[500px] w-full bg-[var(--brand-navy-deep)] relative overflow-hidden">
                    <img src={heroFallback} alt="TIX ID Hero" className="h-full w-full object-contain sm:object-cover opacity-50 absolute" />
                </div>
            </section>
        );
    }

    return (
        <section className="relative w-full pt-[84px] overflow-hidden group">
            <div className="relative w-full h-[280px] sm:h-[400px] md:h-[500px] bg-[var(--brand-navy-deep)] w-full">
                <div
                    className="flex h-full w-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {banners.map((banner, index) => (
                        <div key={banner.id || index} className="h-full w-full flex-shrink-0 relative">
                            <a href={banner.url || '#'} className="block h-full w-full cursor-pointer">
                                <img
                                    src={`${API_BASE}/storage/${banner.image}`}
                                    alt="Promo Banner"
                                    className="h-full w-full object-contain sm:object-cover sm:object-center"
                                />
                            </a>
                        </div>
                    ))}
                </div>

                {banners.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 backdrop-blur-sm'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {banners.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                        className="absolute left-4 sm:left-8 top-[calc(50%+38px)] -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/80 text-[var(--brand-navy)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_8px_30px_rgba(13,43,87,0.15)] cursor-pointer hover:bg-white z-20 border border-slate-100 backdrop-blur-sm"
                        aria-label="Previous banner"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
                        className="absolute right-4 sm:right-8 top-[calc(50%+38px)] -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/80 text-[var(--brand-navy)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_8px_30px_rgba(13,43,87,0.15)] cursor-pointer hover:bg-white z-20 border border-slate-100 backdrop-blur-sm"
                        aria-label="Next banner"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </>
            )}
        </section>
    );
}

function SectionHeading({ eyebrow, title, description }) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--brand-gold)]">
                    {eyebrow}
                </p>
                <h2 className="mt-2 font-sans text-4xl font-extrabold uppercase text-[var(--brand-navy)]">
                    {title}
                </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-muted)] md:text-right">
                {description}
            </p>
        </div>
    );
}

export default function Home() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ticketsRes, bannersRes] = await Promise.all([
                    api.get('/tickets', {
                        params: { sort: 'event_date_asc', upcoming_only: true },
                    }),
                    api.get('/banners')
                ]);

                setTickets(asArray(ticketsRes.data));
                setCategories(ticketsRes.data?.filters?.categories || []);
                setBanners(asArray(bannersRes.data));
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const heroTicket = tickets[0];

    const featuredTickets = useMemo(() => tickets.slice(0, 4), [tickets]);

    const visibleTickets = useMemo(() => {
        if (activeCategory === 'all') return tickets;
        return tickets.filter((ticket) => (ticket.category || '').toLowerCase() === activeCategory);
    }, [activeCategory, tickets]);

    const categoryTabs = useMemo(() => {
        const source = categories.length > 0 ? categories : categoriesFallback;
        return ['all', ...source.map((item) => item.toLowerCase())];
    }, [categories]);

    const MotionArticle = motionLib.article;

    return (
        <div className="page-shell min-h-screen">
            <BannerCarousel banners={banners} />

            <main className="pb-20">


                <section id="now-showing" className="tix-container mt-14">
                    <SectionHeading
                        eyebrow="Now Showing"
                        title="Sedang Tayang"
                        description="Tampilan dibuat lebih clean dengan dominasi navy dan gold, poster tinggi seperti referensi, serta fokus kuat pada judul agar nuansanya dekat dengan landing page BANGSA TIX ID."
                    />

                    <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {loading
                            ? Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="animate-pulse"
                                >
                                    <div className="aspect-[4/6] rounded-[28px] bg-gray-200" />
                                    <div className="mt-4 h-5 w-3/4 rounded-full bg-gray-200" />
                                    <div className="mt-3 h-4 w-2/3 rounded-full bg-gray-200" />
                                </div>
                            ))
                            : featuredTickets.map((ticket, index) => (
                                <Link key={ticket.id} to={`/ticket/${ticket.id}`} className="group">
                                    <MotionArticle
                                        initial={{ opacity: 0, y: 15 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ delay: index * 0.08 }}
                                        className="group transition duration-300 hover:-translate-y-1 block"
                                    >
                                        <div className="relative aspect-[4/6] overflow-hidden rounded-[28px] bg-[rgba(13,43,87,0.035)] border border-[rgba(13,43,87,0.06)]">
                                            <img
                                                src={getImageUrl(ticket.image)}
                                                alt={ticket.title}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                            />
                                            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 sm:p-4">
                                                <span className={`rounded-2xl px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] backdrop-blur-sm ${statusTone[ticket.status] || statusTone.published}`}>
                                                    {statusMap[ticket.status] || 'Now Showing'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-4 pb-2 px-1">
                                            <h3 className="text-xl font-bold uppercase leading-[1.1] text-black truncate sm:whitespace-normal">
                                                {ticket.title}
                                            </h3>
                                            <p className="mt-1.5 text-sm font-semibold text-black/70 truncate">
                                                {ticket.category || 'General'}
                                            </p>
                                        </div>
                                    </MotionArticle>
                                </Link>
                            ))}
                    </div>
                </section>

                <section className="tix-container mt-18">
                    <SectionHeading
                        eyebrow="Discover More"
                        title="Pilihan Lainnya"
                        description={`${visibleTickets.length} judul tersedia sesuai kategori. Saya pertahankan data dinamis dari backend, tetapi tampilannya saya buat lebih editorial agar mirip katalog film pada screenshot.`}
                    />

                    {loading ? (
                        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="animate-pulse"
                                >
                                    <div className="aspect-[4/6] w-full rounded-[28px] bg-[rgba(13,43,87,0.04)]" />
                                    <div className="mt-4 px-2">
                                        <div className="h-6 w-3/4 rounded-full bg-[rgba(13,43,87,0.12)]" />
                                        <div className="mt-3 h-4 w-1/2 rounded-full bg-[rgba(13,43,87,0.08)]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : visibleTickets.length > 0 ? (
                        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {visibleTickets.map((ticket, index) => (
                                <Link key={ticket.id} to={`/ticket/${ticket.id}`} className="group block">
                                    <MotionArticle
                                        initial={{ opacity: 0, y: 15 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ delay: index * 0.03 }}
                                        className="transition duration-300 hover:-translate-y-1"
                                    >
                                        <div className="relative h-64 overflow-hidden rounded-[28px] border border-[rgba(13,43,87,0.06)] bg-[rgba(13,43,87,0.02)]">
                                            <img
                                                src={getImageUrl(ticket.image)}
                                                alt={ticket.title}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,34,67,0)_0%,rgba(9,34,67,0.6)_100%)]" />
                                            <div className="absolute right-4 top-4 z-20">
                                                <span className={`rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] backdrop-blur-sm ${statusTone[ticket.status] || statusTone.published}`}>
                                                    {statusMap[ticket.status] || 'Featured'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 pb-2 px-1">
                                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-black/60">
                                                {ticket.category || 'Event'}
                                            </p>
                                            <h3 className="mt-1 font-bold text-lg sm:text-xl uppercase leading-[1.1] text-black line-clamp-2">
                                                {ticket.title}
                                            </h3>

                                            <div className="mt-3 flex items-center gap-3 text-sm">
                                                <div className="font-extrabold text-black">
                                                    {formatDate(ticket.event_date)}
                                                </div>
                                                <span className="h-1 w-1 rounded-full bg-[var(--brand-gold)]" />
                                                <div className="font-extrabold text-[var(--brand-gold)]">
                                                    {formatPrice(ticket.price)}
                                                </div>
                                            </div>
                                        </div>
                                    </MotionArticle>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-8 rounded-[28px] border border-[rgba(13,43,87,0.08)] bg-[rgba(13,43,87,0.025)] px-6 py-20 text-center">
                            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--brand-gold)]">
                                No Result
                            </p>
                            <h3 className="mt-4 font-sans text-4xl font-extrabold uppercase text-[var(--brand-navy)]">
                                Event Tidak Ditemukan
                            </h3>
                            <p className="mt-5 mx-auto max-w-lg text-sm leading-7 text-[var(--text-muted)]">
                                Coba pilih kategori lain atau tambahkan tiket baru dari dashboard admin.
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
