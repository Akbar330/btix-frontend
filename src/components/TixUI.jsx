/* eslint-disable react-refresh/only-export-components */
import { motion } from 'framer-motion';

export const MotionDiv = motion.div;
export const MotionArticle = motion.article;
export const MotionSection = motion.section;

export function LoadingScreen({ label = 'Memuat tampilan...' }) {
    return (
        <div className="page-shell min-h-screen">
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-[rgba(13,43,87,0.06)] bg-[rgba(255,255,255,0.6)] backdrop-blur-md px-10 py-10 text-center">
                    <div className="relative h-14 w-14 animate-spin rounded-full border-4 border-[rgba(13,43,87,0.08)] border-t-[var(--brand-gold)]" />
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--brand-gold)]">
                            TIX ID
                        </p>
                        <p className="mt-2 text-sm font-bold text-[var(--brand-navy)]">{label}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PageHero({ eyebrow, title, description, actions, align = 'left' }) {
    return (
        <section className="tix-container pt-36 md:pt-40">
            <div className="overflow-hidden rounded-3xl border border-[rgba(13,43,87,0.06)] bg-[rgba(255,255,255,0.4)] backdrop-blur-sm px-6 py-10 sm:px-9 lg:px-12 lg:py-12">
                <div className={`grid gap-6 ${align === 'center' ? 'justify-items-center text-center' : ''}`}>
                    {eyebrow && (
                        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--brand-gold)]">
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="max-w-4xl font-sans text-4xl font-extrabold uppercase leading-[0.92] text-[var(--brand-navy)] sm:text-5xl lg:text-6xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                            {description}
                        </p>
                    )}
                    {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
                </div>
            </div>
        </section>
    );
}

export function SectionIntro({ eyebrow, title, description }) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--brand-gold)]">
                    {eyebrow}
                </p>
                <h2 className="mt-2 font-sans text-3xl font-extrabold uppercase text-[var(--brand-navy)] sm:text-4xl">
                    {title}
                </h2>
            </div>
            {description && (
                <p className="max-w-2xl text-sm leading-7 text-[var(--text-muted)] md:text-right">
                    {description}
                </p>
            )}
        </div>
    );
}

export function SurfaceCard({ children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-[rgba(13,43,87,0.08)] bg-white shadow-[0_18px_45px_rgba(16,39,74,0.06)] ${className}`}>
            {children}
        </div>
    );
}

export function FlatCard({ children, className = '' }) {
    return (
        <div className={`rounded-3xl border border-[rgba(13,43,87,0.06)] bg-[rgba(255,255,255,0.7)] backdrop-blur-md ${className}`}>
            {children}
        </div>
    );
}

export function SectionDivider() {
    return <div className="h-px w-full bg-[rgba(13,43,87,0.06)]" />;
}

export function InfoTile({ label, value, subtle = false }) {
    return (
        <div className={`rounded-2xl px-4 py-4 ${subtle ? 'bg-[rgba(13,43,87,0.04)]' : 'bg-[rgba(216,166,70,0.10)]'}`}>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {label}
            </p>
            <p className="mt-2 text-sm font-extrabold leading-6 text-[var(--brand-navy)]">
                {value}
            </p>
        </div>
    );
}

export function Pill({ children, tone = 'navy' }) {
    const tones = {
        navy: 'bg-[rgba(13,43,87,0.08)] text-[var(--brand-navy)] border-[rgba(13,43,87,0.12)]',
        gold: 'bg-[rgba(216,166,70,0.14)] text-[#8a6827] border-[rgba(216,166,70,0.2)]',
        green: 'bg-[rgba(26,140,86,0.10)] text-[#1c7a50] border-[rgba(26,140,86,0.16)]',
        red: 'bg-[rgba(180,64,64,0.10)] text-[#a33f3f] border-[rgba(180,64,64,0.16)]',
        gray: 'bg-[rgba(116,129,151,0.12)] text-[#627086] border-[rgba(116,129,151,0.16)]',
    };

    return (
        <span className={`inline-flex rounded-2xl border px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] ${tones[tone] || tones.navy}`}>
            {children}
        </span>
    );
}

export function PrimaryButton({ children, className = '', ...props }) {
    return (
        <button
            {...props}
            className={`tix-pill-button cyber-btn px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, className = '', ...props }) {
    return (
        <button
            {...props}
            className={`cyber-btn rounded-2xl border border-[rgba(13,43,87,0.10)] bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)] ${className}`}
        >
            {children}
        </button>
    );
}

export function EmptyState({ eyebrow, title, description, action }) {
    return (
        <FlatCard className="px-6 py-20 text-center">
            {eyebrow && (
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--brand-gold)]">
                    {eyebrow}
                </p>
            )}
            <h3 className="mt-4 font-sans text-4xl font-extrabold uppercase text-[var(--brand-navy)]">
                {title}
            </h3>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
                {description}
            </p>
            {action && <div className="mt-8 flex justify-center">{action}</div>}
        </FlatCard>
    );
}
