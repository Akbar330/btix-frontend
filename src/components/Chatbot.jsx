import { useEffect, useRef, useState, useMemo } from 'react';
import { AnimatePresence, motion as motionLib } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api, { asArray } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const SYSTEM_PROMPT = `Kamu adalah asisten AI untuk platform BANGSA TIX.ID - platform pembelian tiket event online di Indonesia.
Kamu membantu pengguna dengan:
- Informasi tentang event yang tersedia
- Cara pembelian tiket
- Proses pembayaran dan checkout
- Cara melihat tiket yang sudah dibeli (menu "Tiket Saya")
- Pertanyaan umum seputar platform

Gaya bicara kamu: ramah, singkat, profesional, pakai bahasa Indonesia.
Jika ditanya di luar konteks BANGSA TIX.ID atau tiket event, arahkan kembali ke topik BANGSA TIX.ID dengan sopan.
Jika user sudah login, gunakan nama mereka untuk personalisasi.

PENTING: 
1. Jika Anda menyebutkan tiket spesifik, sertakan tag [TICKET_CARD:ID].
2. Jika Anda mengarahkan pengguna ke halaman tertentu, sertakan tag [LINK:path:label]. 
   Contoh: "Lihat tiket Anda di sini: [LINK:/history:Menu Tiket Saya]".
   Daftar Path yang tersedia:
   - /history (Halaman riwayat/tiket saya)
   - / (Halaman beranda/daftar event)
   - /login (Halaman masuk)
   - /register (Halaman daftar)`;

function TypingDots() {
    const MotionSpan = motionLib.span;
    return (
        <div className="flex items-center gap-1.5 px-1 py-1">
            {[0, 1, 2].map((index) => (
                <MotionSpan
                    key={index}
                    className="block h-1.5 w-1.5 rounded-2xl bg-[var(--brand-navy)]"
                    animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: index * 0.15 }}
                />
            ))}
        </div>
    );
}

export default function Chatbot() {
    const { user, loading: authLoading } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem('btix_chat_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [initialGreeting, setInitialGreeting] = useState(() => {
        const saved = sessionStorage.getItem('btix_chat_history');
        return !saved;
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const MotionDiv = motionLib.div;
    const MotionButton = motionLib.button;

    useEffect(() => {
        if (initialGreeting) {
            const greeting = user
                ? `Halo ${user.name}! Saya asisten BTIX ID. Ada yang bisa saya bantu terkait event atau pembelian tiket?`
                : 'Halo! Saya asisten BTIX ID. Ada yang bisa saya bantu terkait event atau tiket?';
            const initialMsg = { role: 'assistant', content: greeting };
            setMessages([initialMsg]);
            sessionStorage.setItem('btix_chat_history', JSON.stringify([initialMsg]));
            setInitialGreeting(false);
        }
    }, [user, initialGreeting]);

    // Persist messages to sessionStorage
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('btix_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    // Clear history on logout
    useEffect(() => {
        if (!user && !authLoading) {
            const saved = sessionStorage.getItem('btix_chat_history');
            if (saved) {
                sessionStorage.removeItem('btix_chat_history');
                setMessages([]);
                setInitialGreeting(true);
            }
        }
    }, [user, authLoading]);

    useEffect(() => {
        api.get('/tickets').then((response) => setEvents(asArray(response.data))).catch(() => { });
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 200);
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const buildSystemMessage = () => {
        let content = SYSTEM_PROMPT;
        if (user) {
            content += `\n\nInformasi pengguna saat ini:\n- Nama: ${user.name}\n- Email: ${user.email}`;
        }
        if (events.length > 0) {
            const eventList = events.map((event) =>
                `- [ID: ${event.id}] ${event.title} | Tanggal: ${new Date(event.event_date).toLocaleDateString('id-ID')} | Harga: Rp ${Number(event.price).toLocaleString('id-ID')} | Sisa Quota: ${event.quota}`
            ).join('\n');
            content += `\n\nDaftar event yang tersedia saat ini:\n${eventList}`;
        }
        return { role: 'system', content };
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMessage = { role: 'user', content: text };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/chatbot', {
                system_prompt: buildSystemMessage().content,
                messages: newMessages.map((message) => ({ role: message.role, content: message.content })),
            });
            const reply = response.data?.reply || 'Maaf, terjadi kesalahan. Coba lagi ya!';
            setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Koneksi bermasalah. Coba beberapa saat lagi.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <MotionDiv
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="fixed bottom-24 right-5 z-50 flex max-h-[80vh] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[rgba(13,43,87,0.10)] bg-[rgba(255,253,248,0.97)] shadow-[0_28px_70px_rgba(16,39,74,0.18)]"
                        style={{ backdropFilter: 'blur(18px)' }}
                    >
                        <div className="flex items-center gap-3 border-b border-[rgba(13,43,87,0.08)] bg-[rgba(13,43,87,0.03)] px-5 py-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)] text-xs font-extrabold text-white">
                                AI
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-sans text-xl font-extrabold uppercase leading-none text-[var(--brand-navy)]">
                                    Tix Assistant
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                    {user ? user.name : 'Online'}
                                </p>
                            </div>
                            <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--brand-navy)] hover:bg-[rgba(13,43,87,0.06)]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto p-4">
                            {messages.map((message, index) => (
                                <MotionDiv
                                    key={index}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} gap-2`}
                                >
                                    <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user'
                                            ? 'bg-[var(--brand-navy)] text-white'
                                            : 'bg-white text-[var(--brand-navy)] border border-[rgba(13,43,87,0.08)] shadow-sm'
                                        }`}>
                                        {message.content.replace(/\[TICKET_CARD:\d+\]|\[LINK:[^\]]+\]/g, '').trim()}
                                    </div>

                                    {/* Render Cards if present in message */}
                                    {message.role === 'assistant' && (
                                        <div className="flex w-full flex-col gap-2">
                                            {/* Ticket Cards */}
                                            {[...message.content.matchAll(/\[TICKET_CARD:(\d+)\]/g)].map((match) => {
                                                const ticketId = parseInt(match[1]);
                                                const ticket = events.find(e => Number(e.id) === ticketId);
                                                if (!ticket) return null;

                                                return (
                                                    <MotionDiv
                                                        key={`${index}-ticket-${ticketId}`}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                                                        className="group flex max-w-[85%] cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-[rgba(216,166,70,0.2)] bg-white p-3 shadow-md transition-all hover:border-[var(--brand-gold)] hover:shadow-lg"
                                                    >
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(216,166,70,0.1)] text-[var(--brand-gold)]">
                                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="truncate text-xs font-black uppercase tracking-wider text-[var(--brand-navy)] group-hover:text-[var(--brand-gold)]">
                                                                {ticket.title}
                                                            </h4>
                                                            <div className="mt-1 flex items-baseline gap-1.5">
                                                                <span className="text-[10px] font-bold text-[var(--text-muted)]">Rp</span>
                                                                <span className="text-sm font-black text-[var(--brand-navy)]">
                                                                    {Number(ticket.price).toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(13,43,87,0.04)] text-[var(--brand-gold)] transition-colors group-hover:bg-[var(--brand-gold)] group-hover:text-white">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7-7 7" /></svg>
                                                        </div>
                                                    </MotionDiv>
                                                );
                                            })}

                                            {/* Navigation Link Cards */}
                                            {[...message.content.matchAll(/\[LINK:([^:]+):([^\]]+)\]/g)].map((match, i) => {
                                                const path = match[1];
                                                const label = match[2];

                                                return (
                                                    <MotionDiv
                                                        key={`${index}-link-${i}`}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                        onClick={() => navigate(path)}
                                                        className="group flex max-w-[85%] cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-[rgba(13,43,87,0.08)] bg-[rgba(13,43,87,0.02)] p-3 shadow-sm transition-all hover:bg-[var(--brand-navy)] hover:text-white"
                                                    >
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/50 text-[var(--brand-navy)] transition-colors group-hover:bg-white/20 group-hover:text-white">
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-xs font-black uppercase tracking-wider">
                                                                {label}
                                                            </h4>
                                                            <p className="text-[10px] font-bold opacity-60">Buka Halaman</p>
                                                        </div>
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                        </div>
                                                    </MotionDiv>
                                                );
                                            })}
                                        </div>
                                    )}
                                </MotionDiv>
                            ))}

                            {loading && (
                                <MotionDiv initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                                    <div className="rounded-2xl border border-[rgba(13,43,87,0.08)] bg-white px-4 py-3">
                                        <TypingDots />
                                    </div>
                                </MotionDiv>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="border-t border-[rgba(13,43,87,0.08)] bg-white px-3 py-3">
                            <div className="flex items-end gap-2 rounded-2xl border border-[rgba(13,43,87,0.10)] bg-[rgba(13,43,87,0.03)] px-3 py-2">
                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="Tulis pertanyaan..."
                                    className="max-h-24 flex-1 resize-none border-none bg-transparent py-1 text-sm leading-relaxed outline-none"
                                    style={{ color: '#22304a', scrollbarWidth: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy)] disabled:opacity-40"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                            <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                Powered by Bangsa Tix AI
                            </p>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>

            <MotionButton
                type="button"
                onClick={() => setOpen((value) => !value)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_18px_40px_rgba(16,39,74,0.22)]"
                style={{
                    background: open ? 'var(--brand-navy)' : 'linear-gradient(180deg, var(--brand-gold-soft) 0%, var(--brand-gold) 100%)',
                    color: open ? '#fff' : 'var(--brand-navy)',
                }}
                aria-label="Open AI Chatbot"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {open ? (
                        <MotionDiv
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            className="flex"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </MotionDiv>
                    ) : (
                        <MotionDiv
                            key="chat"
                            initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                            className="flex"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </MotionDiv>
                    )}
                </AnimatePresence>
            </MotionButton>
        </>
    );
}
