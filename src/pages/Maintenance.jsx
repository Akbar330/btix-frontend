import { motion } from 'framer-motion';

export default function Maintenance() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-slate-900 font-sans">
            <div className="max-w-2xl w-full text-center relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex flex-col items-center gap-8 mb-12">
                        <div className="relative h-24 w-24">
                            {/* Rotating Gear */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 text-slate-100"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full opacity-40">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </motion.div>

                            {/* Hammer Animation */}
                            <motion.div
                                animate={{ rotate: [-20, 20, -20] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-0 left-0 h-16 w-16 text-[var(--brand-gold)] drop-shadow-lg"
                                style={{ transformOrigin: 'bottom right' }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
                                    <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
                                    <path d="M17.64 15 22 10.64" />
                                    <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-1.12-2.22L18.1 6.58c-.1-.38-.49-.62-.87-.52l-.4.1a2 2 0 0 1-2 0l-.3-.18c-.37-.21-.49-.68-.28-1.05l.3-.54c.2-.37.07-.82-.28-1.04l-1.09-.72c-.35-.22-.8-.11-1.02.25l-.3.53a1 1 0 0 1-1.05.51c-.6-.1-.95-.7-1.15-1.26l-.42-1.2c-.13-.37-.54-.58-.91-.48l-.42.12c-.37.1-.6.48-.5.85l.4 1.13c.2.56.2 1.2 0 1.76l-.42 1.13c-.1.37-.48.6-.85.5L7.2 2.58a.5.5 0 0 0-.6.4l-.15.42c-.1.38.1.76.49.86l1.24.3c.8.2 1.63.53 2.22 1.13l1.25 1.25" />
                                </svg>
                            </motion.div>
                        </div>
                        
                        <div className="text-2xl font-black tracking-tighter text-slate-900 uppercase flex items-center gap-2">
                            BANGSA <span className="text-[var(--brand-gold)]">TIX</span>.ID
                        </div>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none text-slate-900 mb-6">
                            SEDANG DALAM <br />
                            PERBAIKAN
                        </h1>
                        <div className="h-1.5 w-20 bg-slate-900 mx-auto rounded-full" />
                    </div>

                    <p className="max-w-lg mx-auto text-lg sm:text-xl text-slate-500 font-medium leading-relaxed mb-16">
                        Kami sedang menyiapkan sesuatu yang lebih baik untuk Anda. <br className="hidden sm:block" /> 
                        Situs akan segera kembali dalam waktu dekat.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
                        <div className="p-8 rounded-3xl border-2 border-slate-100 bg-slate-50/50">
                            <span className="block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Estimasi Waktu</span>
                            <p className="text-3xl font-black text-slate-900">~ 2 Jam</p>
                        </div>
                        <div className="p-8 rounded-3xl border-2 border-slate-100 bg-slate-50/50">
                            <span className="block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Status Sistem</span>
                            <p className="text-3xl font-black text-slate-900 italic">Updating</p>
                        </div>
                    </div>

                    <div className="mt-24 pt-12 border-t border-slate-100 italic">
                        <p className="text-slate-400 text-sm font-medium"> 
                            &copy; 2026 Admin Control Center
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
