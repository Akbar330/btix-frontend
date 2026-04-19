import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../utils/api';
import { Pill, PrimaryButton, SurfaceCard, SectionIntro } from '../../components/TixUI';

export default function Scanner() {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: { width: 250, height: 250 },
            fps: 5,
        });

        scanner.render(
            async (text) => {
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
            },
            () => {}
        );

        return () => {
            scanner.clear().catch((error) => console.error('Failed to clear scanner', error));
        };
    }, []);

    const resetScanner = () => window.location.reload();

    return (
        <div className="animate-float-up">
            <header className="mb-10 text-center">
                <SectionIntro 
                    eyebrow="Access Terminal" 
                    title="Scan QR Ticket" 
                    description="Verifikasi tiket masuk pengunjung secara cepat dan akurat menggunakan kamera perangkat."
                />
            </header>

            <SurfaceCard className="mx-auto max-w-2xl p-6 sm:p-10">
                    {loading ? (
                        <div className="flex flex-col items-center py-16">
                            <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-[rgba(13,43,87,0.08)] border-t-[var(--brand-gold)]" />
                            <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                Verifying Ticket
                            </p>
                        </div>
                    ) : scanResult ? (
                        <div className="py-4 text-center">
                            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-lg ${scanResult.type === 'success' ? 'bg-[#1c7a50]' : 'bg-[#a33f3f]'}`}>
                                {scanResult.type === 'success' ? (
                                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                            </div>

                            <h2 className={`mt-6 font-sans text-3xl font-extrabold uppercase ${scanResult.type === 'success' ? 'text-[#1c7a50]' : 'text-[#a33f3f]'}`}>
                                {scanResult.message}
                            </h2>

                            {scanResult.type === 'success' && scanResult.data && (
                                <div className="mt-8 rounded-2xl bg-[rgba(13,43,87,0.04)] p-5 text-left">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Pill tone="green">Verified</Pill>
                                        <Pill tone="navy">{scanResult.data.quantity} Admit</Pill>
                                    </div>
                                    <p className="mt-4 font-sans text-3xl font-extrabold uppercase leading-[0.95] text-[var(--brand-navy)]">
                                        {scanResult.data.ticket?.title}
                                    </p>
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <InfoBlock label="Guest" value={scanResult.data.user?.name} />
                                        <InfoBlock label="Quantity" value={String(scanResult.data.quantity)} />
                                    </div>
                                </div>
                            )}

                            <div className="mt-8">
                                <PrimaryButton type="button" onClick={resetScanner} className="w-full">
                                    Scan Another Pass
                                </PrimaryButton>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-4 text-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                Target QR Code
                            </p>
                            <div id="reader" className="w-full overflow-hidden rounded-2xl bg-[rgba(13,43,87,0.04)] p-2" />
                        </div>
                    )}
                </SurfaceCard>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    #reader { border: none !important; }
                    #reader__dashboard_section_csr span { display: none !important; }
                    #reader__dashboard_section_swaplink { display: none !important; }
                    #reader__camera_selection { padding: 12px; border-radius: 18px; border: 1px solid rgba(13,43,87,0.12); margin-bottom: 15px; width: 100%; outline: none; color: #22304a; }
                    #reader button { background: #0d2b57; color: white; border: none; padding: 12px 18px; border-radius: 999px; font-weight: 800; cursor: pointer; transition: 0.3s; margin: 4px; text-transform: uppercase; letter-spacing: .08em; }
                    #reader__scan_region { background: white; margin-top: 15px; border-radius: 22px; overflow: hidden; }
                    #reader__scan_region video { object-fit: cover !important; }
                `,
                }} />
            </div>
    );
}

function InfoBlock({ label, value }) {
    return (
        <div className="rounded-2xl bg-white px-4 py-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
            <p className="mt-2 font-extrabold text-[var(--brand-navy)]">{value}</p>
        </div>
    );
}
