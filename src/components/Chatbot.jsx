import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
Jika user sudah login, gunakan nama mereka untuk personalisasi. Contoh: "Hai [Nama], ada yang bisa saya bantu hari ini?"
Jika ditanya tentang siapa nama saya(pengguna), jawab dengan nama pengguna yang sudah login. Contoh: "Nama saya [Nama Pengguna]."

Data event yang tersedia akan diberikan saat konteks dibutuhkan.`;

function TypingDots() {
    return (
        <div className="flex items-center gap-1.5 px-1 py-1">
            {[0, 1, 2].map(i => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full block"
                    style={{ background: 'rgba(14,165,233,0.7)' }}
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                />
            ))}
        </div>
    );
}

export default function Chatbot() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [initialGreeting, setInitialGreeting] = useState(true);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (initialGreeting) {
            const greeting = user
                ? `Halo **${user.name}**! ⚡ Saya asisten BTIX.ID. Ada yang bisa saya bantu terkait event atau pembelian tiket?`
                : 'Hei! ⚡ Saya asisten **BTIX.ID**. Ada yang bisa saya bantu terkait event atau tiket?';
            setMessages([{ role: 'assistant', content: greeting }]);
            setInitialGreeting(false);
        }
    }, [user, initialGreeting]);

    useEffect(() => {
        api.get('/tickets').then((r) => setEvents(asArray(r.data))).catch(() => {});
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
            content += `\n\nInformasi pengguna saat ini:\n- Nama: ${user.name}\n- Email: ${user.email}\n- Status Membership: ${user.membership || 'Basic'}\n- Nomor Telepon: ${user.phone || 'Tidak tersedia'}`;
        }
        if (events.length > 0) {
            const eventList = events.map(e =>
                `- ${e.title} | Tanggal: ${new Date(e.event_date).toLocaleDateString('id-ID')} | Harga: Rp ${Number(e.price).toLocaleString('id-ID')} | Sisa Quota: ${e.quota}`
            ).join('\n');
            content += `\n\nDaftar event yang tersedia saat ini:\n${eventList}`;
        }
        return { role: 'system', content };
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        const userMsg = { role: 'user', content: text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        try {
            const response = await api.post('/chatbot', {
                system_prompt: buildSystemMessage().content,
                messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            });
            const reply = response.data?.reply || 'Maaf, terjadi kesalahan. Coba lagi ya!';
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Koneksi bermasalah. Coba beberapa saat lagi.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <>
            {/* ── Chat Window ─────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col overflow-hidden"
                        style={{
                            height: '520px',
                            borderRadius: '1.5rem',
                            background: 'rgba(4, 10, 25, 0.97)',
                            backdropFilter: 'blur(30px)',
                            border: '1px solid rgba(14,165,233,0.22)',
                            boxShadow: '0 0 60px rgba(14,165,233,0.12), 0 30px 60px rgba(0,0,0,0.7)',
                        }}
                    >
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.7), transparent)' }} />

                        {/* ── Header ── */}
                        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                            style={{
                                background: 'rgba(6,15,35,0.9)',
                                borderBottom: '1px solid rgba(14,165,233,0.12)',
                            }}>
                            {/* AI Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black text-xs font-black"
                                    style={{
                                        background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
                                        boxShadow: '0 0 14px rgba(14,165,233,0.5)',
                                    }}>
                                    AI
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                                    style={{ background: '#10b981', borderColor: '#040a19', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white leading-none" style={{ fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em' }}>
                                    BTIX.ID AI
                                </p>
                                <p className="text-[11px] mt-0.5 font-mono" style={{ color: 'rgba(14,165,233,0.7)' }}>
                                    {user ? `● ${user.name}` : '● Online — Siap membantu'}
                                </p>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* ── Messages ── */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(14,165,233,0.2) transparent' }}>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {/* AI avatar */}
                                    {msg.role === 'assistant' && (
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] text-black font-black shrink-0 mb-0.5"
                                            style={{ background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)', boxShadow: '0 0 8px rgba(14,165,233,0.4)' }}>
                                            AI
                                        </div>
                                    )}

                                    <div
                                        className="max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                                        style={msg.role === 'user' ? {
                                            background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(56,189,248,0.15))',
                                            border: '1px solid rgba(14,165,233,0.35)',
                                            borderRadius: '16px 16px 4px 16px',
                                            color: '#e2e8f0',
                                            boxShadow: '0 0 12px rgba(14,165,233,0.08)',
                                        } : {
                                            background: 'rgba(14,20,45,0.9)',
                                            border: '1px solid rgba(14,165,233,0.15)',
                                            borderRadius: '16px 16px 16px 4px',
                                            color: '#cbd5e1',
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-end gap-2 justify-start"
                                >
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] text-black font-black shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)', boxShadow: '0 0 8px rgba(14,165,233,0.4)' }}>
                                        AI
                                    </div>
                                    <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm"
                                        style={{ background: 'rgba(14,20,45,0.9)', border: '1px solid rgba(14,165,233,0.15)' }}>
                                        <TypingDots />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* ── Input ── */}
                        <div className="flex-shrink-0 px-3 py-3"
                            style={{ borderTop: '1px solid rgba(14,165,233,0.1)', background: 'rgba(4,10,25,0.95)' }}>
                            <div className="flex items-end gap-2 px-3 py-2 rounded-xl transition-all"
                                style={{
                                    background: 'rgba(14,165,233,0.05)',
                                    border: '1px solid rgba(14,165,233,0.18)',
                                }}>
                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="Ketik pesan..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm leading-relaxed py-0.5 resize-none max-h-24"
                                    style={{
                                        color: '#e2e8f0',
                                        scrollbarWidth: 'none',
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
                                        boxShadow: input.trim() ? '0 0 14px rgba(14,165,233,0.5)' : 'none',
                                    }}
                                >
                                    <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-[10px] text-center mt-1.5 font-mono tracking-wider"
                                style={{ color: 'rgba(14,165,233,0.3)' }}>
                                POWERED BY GROQ · LLAMA 3.3 70B
                            </p>
                        </div>

                        {/* Corner accents */}
                        <div className="absolute bottom-0 left-0 right-0 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Floating Button ─────────────────────────── */}
            <motion.button
                onClick={() => setOpen(o => !o)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                    background: open
                        ? 'rgba(6,15,35,0.95)'
                        : 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
                    border: open
                        ? '1px solid rgba(14,165,233,0.3)'
                        : 'none',
                    boxShadow: open
                        ? '0 0 20px rgba(14,165,233,0.2)'
                        : '0 0 25px rgba(14,165,233,0.55), 0 8px 20px rgba(0,0,0,0.5)',
                    color: open ? '#0ea5e9' : '#000',
                }}
                aria-label="Open AI Chatbot"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {open ? (
                        <motion.svg
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="w-5 h-5"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                    ) : (
                        <motion.svg
                            key="chat"
                            initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.18 }}
                            className="w-6 h-6"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </motion.svg>
                    )}
                </AnimatePresence>

                {/* Pulse ring — only when closed */}
                {!open && (
                    <motion.span
                        className="absolute inset-0 rounded-2xl -z-10"
                        style={{ background: 'rgba(14,165,233,0.5)' }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    />
                )}
            </motion.button>
        </>
    );
}
