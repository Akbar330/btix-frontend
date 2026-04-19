export default function Footer() {
    return (
        <footer className="mt-20 border-t border-[rgba(13,43,87,0.08)] bg-[rgba(255,253,248,0.94)]">
            <div className="tix-container flex flex-col gap-6 px-1 py-10 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="tix-brand text-[2.2rem] leading-none">
                        BANGSA TIX<span className="tix-brand-mark" />ID
                    </div>
                    <p className="mt-3 max-w-md text-sm leading-7 text-[var(--text-muted)]">
                        Platform tiket dengan tampilan yang lebih bersih, editorial, dan modern, terinspirasi dari gaya visual TIX.ID pada referensi.
                    </p>
                </div>

                <div className="grid gap-2 text-sm text-[var(--text-muted)] md:text-right">
                    <p className="font-bold uppercase tracking-[0.16em] text-[var(--brand-navy)]">
                        Bangsa TIX ID
                    </p>
                    <p>© 2026 All rights reserved.</p>
                    <p>Designed with navy, gold, and clean cinematic layout.</p>
                </div>
            </div>
        </footer>
    );
}
