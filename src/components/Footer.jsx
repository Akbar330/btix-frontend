export default function Footer() {
    return (
        <footer style={{
            background: 'rgba(6,15,35,0.8)',
            borderTop: '1px solid rgba(14,165,233,0.1)',
            backdropFilter: 'blur(10px)',
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-black text-sm"
                            style={{ background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)', boxShadow: '0 0 12px rgba(14,165,233,0.4)' }}>
                            B
                        </div>
                        <span className="font-black text-slate-400">
                            <span style={{ color: '#00d4ff' }}>BTIX</span> ID
                        </span>
                    </div>
                    <p className="text-slate-600 text-xs font-mono tracking-widest">
                        © 2026 BTIX.ID // ALL RIGHTS RESERVED
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                            style={{ boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
                        <span className="text-xs text-slate-600 font-mono tracking-wider">SYSTEM ONLINE</span>
                    </div>
                </div>
                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            </div>
        </footer>
    );
}
