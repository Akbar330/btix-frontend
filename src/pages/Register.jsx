import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MotionDiv } from '../components/TixUI';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-shell min-h-screen">
            <div className="tix-container flex min-h-screen items-center justify-center py-10">
                <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.94fr_1fr]">
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="tix-soft-card rounded-2xl px-6 py-8 sm:px-9 sm:py-10"
                    >
                        <div className="text-center">
                            <div className="tix-brand text-[3rem] leading-none">BTIX<span className="tix-brand-mark" />ID</div>
                            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--brand-gold)]">
                                New Account
                            </p>
                            <h2 className="mt-3 font-sans text-4xl font-extrabold uppercase text-[var(--brand-navy)]">
                                Buat Akun
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                                Bergabung untuk membeli tiket, memantau transaksi, dan menikmati pengalaman premium.
                            </p>
                        </div>

                        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-2xl bg-rose-50 px-4 py-4 text-sm font-semibold text-rose-600">
                                    {error}
                                </div>
                            )}

                            <label className="grid gap-2 text-sm font-bold text-[var(--brand-navy)]">
                                Nama Lengkap
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="cyber-input rounded-2xl px-4 py-3" placeholder="John Doe" />
                            </label>

                            <label className="grid gap-2 text-sm font-bold text-[var(--brand-navy)]">
                                Email
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="cyber-input rounded-2xl px-4 py-3" placeholder="user@domain.com" />
                            </label>

                            <label className="grid gap-2 text-sm font-bold text-[var(--brand-navy)]">
                                Password
                                <input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="cyber-input rounded-2xl px-4 py-3" placeholder="Minimal 8 karakter" />
                            </label>

                            <button type="submit" disabled={loading} className="tix-pill-button mt-2 px-6 py-4 text-sm disabled:opacity-60">
                                {loading ? 'Memproses...' : 'Daftar'}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="font-extrabold text-[var(--brand-navy)]">
                                Masuk di sini
                            </Link>
                        </div>
                    </MotionDiv>

                    <MotionDiv
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden rounded-2xl bg-[linear-gradient(135deg,#d8a646_-10%,#143d79_55%,#0d2b57_100%)] p-10 text-white shadow-[0_30px_80px_rgba(16,39,74,0.22)] lg:flex lg:flex-col lg:justify-between"
                    >
                        <div className="tix-brand text-[3.6rem] leading-none text-white">
                            BTIX<span className="tix-brand-mark" />ID
                        </div>
                        <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#fff2c8]">Start Here</p>
                            <h1 className="mt-4 font-sans text-6xl font-extrabold uppercase leading-[0.9]">
                                Create
                                <br />
                                Your Pass
                            </h1>
                            <p className="mt-5 max-w-lg text-sm leading-7 text-white/84">
                                Registrasi saya buat menyatu dengan bahasa visual TIX ID: clean, warm, dan premium, tanpa nuansa terminal gelap seperti sebelumnya.
                            </p>
                        </div>
                    </MotionDiv>
                </div>
            </div>
        </div>
    );
}
