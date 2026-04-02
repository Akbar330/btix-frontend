import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
            <Navbar />
            
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-delay-1000" />

            <div className="relative z-10 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="relative inline-block mb-8">
                        <motion.h1 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-[12rem] sm:text-[16rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 select-none"
                        >
                            404
                        </motion.h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div 
                                animate={{ 
                                    y: [0, -15, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 4, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-primary-500 via-violet-500 to-indigo-600 rounded-3xl rotate-12 shadow-2xl shadow-primary-500/20 flex items-center justify-center p-8 backdrop-blur-xl border border-white/20"
                            >
                                <svg className="w-full h-full text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </motion.div>
                        </div>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-display font-black text-white mb-4 tracking-tight">Ups! Tiket Tidak Ditemukan</h2>
                    <p className="text-slate-400 text-lg max-w-md mx-auto mb-10 font-medium leading-relaxed">
                        Sepertinya halaman yang kamu cari sudah dipesan orang lain atau link yang kamu tuju salah alamat.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/"
                            className="px-8 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                        >
                            Kembali ke Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="px-8 py-4 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md transform hover:scale-105 active:scale-95"
                        >
                            Sebelumnya
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div 
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }} 
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-1/4 right-[15%] w-12 h-12 bg-primary-400/20 rounded-full blur-xl hidden md:block"
            />
            <motion.div 
                animate={{ y: [0, 20, 0], x: [0, -10, 0] }} 
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute bottom-1/4 left-[15%] w-16 h-16 bg-violet-400/20 rounded-full blur-xl hidden md:block"
            />
        </div>
    );
}
