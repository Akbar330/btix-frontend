import { Link } from 'react-router-dom';
import { MotionDiv, PageHero, PrimaryButton, SecondaryButton, FlatCard } from '../components/TixUI';

export default function NotFound() {
    return (
        <div className="page-shell min-h-screen">
            

            <PageHero
                eyebrow="404"
                title="Halaman tidak ditemukan"
                description="Route yang kamu buka tidak tersedia atau sudah dipindahkan. Saya samakan juga halaman 404 ini agar tetap terasa bagian dari desain baru."
                align="center"
            />

            <div className="tix-container pb-20">
                <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <FlatCard className="mx-auto mt-12 max-w-4xl px-6 py-16 text-center sm:px-10">
                        <div className="font-sans text-[8rem] font-extrabold leading-none text-[rgba(13,43,87,0.12)] sm:text-[12rem]">
                            404
                        </div>
                        <h2 className="mt-4 font-sans text-4xl font-extrabold uppercase text-[var(--brand-navy)]">
                            Ups, tiketnya nyasar
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
                            Sepertinya halaman yang kamu cari sudah dipindahkan atau tautannya tidak valid.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link to="/" className="tix-pill-button px-7 py-4 text-sm">
                                Kembali Ke Home
                            </Link>
                            <SecondaryButton type="button" onClick={() => window.history.back()}>
                                Halaman Sebelumnya
                            </SecondaryButton>
                        </div>
                    </FlatCard>
                </MotionDiv>
            </div>
        </div>
    );
}
