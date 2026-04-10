import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

export default function Scanner() {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // html5-qrcode renderer
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 5,
        });

        scanner.render(async (text) => {
            scanner.clear();
            setLoading(true);
            try {
                const res = await api.post('/admin/scan', { qr_data: text });
                setScanResult({ type: 'success', message: res.data.message, data: res.data.transaction });
            } catch (err) {
                setScanResult({ type: 'error', message: err.response?.data?.message || 'Verification failed' });
            } finally {
                setLoading(false);
            }
        }, (err) => {
            // Ignore ongoing scan errors which are just 'not found yet'
        });

        return () => {
            scanner.clear().catch(error => console.error('Failed to clear scanner', error));
        };
    }, []);

    const resetScanner = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-[-10%] w-[50%] h-[500px] bg-primary-300/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob pointer-events-none"></div>

            <Navbar />

            <div className="pt-32 pb-20 max-w-lg mx-auto px-4 z-10 relative">
                <h1 className="text-3xl font-display font-extrabold text-center text-slate-900 mb-8 tracking-tight">Access Terminal</h1>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white"
                >
                    {loading ? (
                        <div className="flex flex-col items-center py-16">
                            <div className="relative w-16 h-16 mb-4">
                                <div className="absolute inset-0 rounded-full border-t-4 border-primary-500 animate-spin"></div>
                                <div className="absolute inset-2 rounded-full border-r-4 border-indigo-400 animate-spin animation-delay-200"></div>
                            </div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Verifying Ticket...</p>
                        </div>
                    ) : scanResult ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                            <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center mb-6 text-white shadow-lg ${scanResult.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'} transform rotate-3`}>
                                {scanResult.type === 'success' ? (
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                            </div>
                            <h2 className={`text-2xl font-bold mb-2 ${scanResult.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {scanResult.message}
                            </h2>
                            {scanResult.type === 'success' && scanResult.data && (
                                <div className="mt-6 p-5 bg-white rounded-3xl text-left border border-slate-100 shadow-inner">
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1.5">Pass Details</p>
                                    <p className="font-display font-bold text-xl text-slate-900 mb-3">{scanResult.data.ticket?.title}</p>
                                    <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-2xl">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Guest</p>
                                            <p className="font-bold text-slate-800">{scanResult.data.user?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 font-medium">Admit</p>
                                            <p className="font-bold text-slate-800">{scanResult.data.quantity}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button onClick={resetScanner} className="mt-8 px-6 py-3.5 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-blue-600/30 hover:-translate-y-1 transition-all">
                                Scan Another Pass
                            </button>
                        </motion.div>
                    ) : (
                        <div>
                            <p className="text-center text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">Target QR Code</p>
                            <div id="reader" className="w-full overflow-hidden rounded-3xl border-0! shadow-inner bg-slate-100"></div>
                        </div>
                    )}
                </motion.div>

                {/* Specific css to override html5-qrcode ugly defaults */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    #reader { border: none !important; }
                    #reader__dashboard_section_csr span { display: none !important; }
                    #reader__dashboard_section_swaplink { display: none !important; }
                    #reader__camera_selection { padding: 8px; border-radius: 8px; border-color: #cbd5e1; margin-bottom: 15px; width: 100%; outline: none; }
                    #reader button { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; margin: 4px; }
                    #reader button:hover { background: #1d4ed8; }
                    #reader__scan_region { background: white; margin-top: 15px; border-radius: 16px; overflow: hidden; }
                    #reader__scan_region video { object-fit: cover !important; }
                `}} />
            </div>
        </div>
    );
}
