import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { asArray } from '../utils/api';

const SYSTEM_PROMPT = `Kamu adalah asisten AI untuk platform BANGSA TIX.ID — platform pembelian tiket event online di Indonesia.
Kamu membantu pengguna dengan:
- Informasi tentang event yang tersedia
- Cara pembelian tiket
- Proses pembayaran dan checkout
- Cara melihat tiket yang sudah dibeli (menu "Tiket Saya")
- Pertanyaan umum seputar platform

Gaya bicara kamu: ramah, singkat, profesional, pakai bahasa Indonesia.
Jika ditanya di luar konteks BANGSA TIX.ID atau tiket event, arahkan kembali ke topik BANGSA TIX.ID dengan sopan.

Data event yang tersedia akan diberikan saat konteks dibutuhkan.`;

function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-1 py-0.5">
            {[0, 1, 2].map(i => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full block"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
            ))}
        </div>
    );
}

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hei! 👋 Saya asisten BANGSA TIX.ID. Ada yang bisa saya bantu terkait event atau pembelian tiket?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        api.get('/tickets')
            .then((r) => {
                setEvents(asArray(r.data));
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const buildSystemMessage = () => {
        let content = SYSTEM_PROMPT;
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
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 border border-white/60"
                        style={{ height: '520px' }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-primary-600 to-violet-600 flex-shrink-0">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold border border-white/30">
                                    🤖
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm leading-none">BANGSA TIX.ID AI</p>
                                <p className="text-white/70 text-xs mt-0.5">Online · Siap membantu</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/95 backdrop-blur-xl">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5 shadow-sm">
                                            🤖
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm
                                        ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-primary-500 to-violet-600 text-white rounded-br-sm'
                                                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5 shadow-sm">
                                        🤖
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                                        <TypingDots />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="flex-shrink-0 px-3 py-3 bg-white/95 backdrop-blur-xl border-t border-slate-100">
                            <div className="flex items-end gap-2 bg-slate-100/70 rounded-2xl px-3 py-2 border border-slate-200/60 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="Ketik pesan..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 resize-none max-h-24 leading-relaxed py-0.5"
                                    style={{ scrollbarWidth: 'none' }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-primary-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-primary-500/50 transition-all flex-shrink-0"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 text-center mt-1.5">Powered by Groq · Llama 3.3 70B</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                onClick={() => setOpen(o => !o)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 text-white shadow-xl shadow-primary-500/40 flex items-center justify-center transition-all"
                aria-label="Open AI Chatbot"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {open ? (
                        <motion.svg
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-6 h-6"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                    ) : (
                        <motion.span
                            key="bot"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-2xl leading-none"
                        >
                            💬
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Pulse ring */}
                {!open && (
                    <motion.span
                        className="absolute inset-0 rounded-2xl bg-primary-400 -z-10"
                        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    />
                )}
            </motion.button>
        </>
    );
}
