import { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';

const cyberInput = 'w-full rounded-xl px-4 py-3 text-sm font-medium cyber-input';

const tierConfig = [
    { accentColor: '#94a3b8', glowColor: 'rgba(148,163,184,0.2)', borderColor: 'rgba(148,163,184,0.18)', label: 'BASIC' },
    { accentColor: '#0ea5e9', glowColor: 'rgba(14,165,233,0.25)', borderColor: 'rgba(14,165,233,0.3)', label: 'POPULAR' },
    { accentColor: '#ffd700', glowColor: 'rgba(255,215,0,0.25)',  borderColor: 'rgba(255,215,0,0.3)',  label: 'PREMIUM' },
];

export default function MembershipPlansManager() {
    const [plans, setPlans]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving]       = useState(false);
    const [editData, setEditData]   = useState(null);
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => { fetchPlans(); }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/membership-plans');
            setPlans(res.data);
        } catch {
            alert('Failed to load membership plans');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan) => {
        setEditingId(plan.id);
        setEditData({ ...plan });
        setNewFeature('');
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData(null);
        setNewFeature('');
    };

    const handleSave = async () => {
        if (!editData) return;
        setSaving(true);
        try {
            await api.patch(`/admin/membership-plans/${editData.id}`, {
                display_name:        editData.display_name,
                price:               Number(editData.price),
                discount_percentage: Number(editData.discount_percentage),
                description:         editData.description,
                features:            editData.features,
                is_active:           editData.is_active,
            });
            await fetchPlans();
            setEditingId(null);
            setEditData(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update plan');
        } finally {
            setSaving(false);
        }
    };

    const handleAddFeature = () => {
        if (newFeature.trim() && editData) {
            setEditData({ ...editData, features: [...(editData.features || []), newFeature.trim()] });
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (idx) => {
        if (editData) {
            setEditData({ ...editData, features: editData.features.filter((_, i) => i !== idx) });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"
                        style={{ boxShadow: '0 0 12px rgba(14,165,233,0.5)' }} />
                    <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin"
                        style={{ animationDirection: 'reverse' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => {
                const cfg = tierConfig[idx] || tierConfig[0];
                const isEditing = editingId === plan.id;

                return (
                    <motion.div
                        key={plan.id}
                        layout
                        className="relative overflow-hidden rounded-2xl"
                        style={{
                            background: 'rgba(4, 10, 25, 0.9)',
                            backdropFilter: 'blur(16px)',
                            border: `1px solid ${cfg.borderColor}`,
                            boxShadow: isEditing
                                ? `0 0 30px ${cfg.glowColor}, 0 0 60px ${cfg.glowColor}50`
                                : `0 0 15px rgba(0,0,0,0.4)`,
                            transition: 'box-shadow 0.3s ease',
                        }}
                    >
                        {/* Top glow line */}
                        <div className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${cfg.accentColor}80, transparent)` }} />

                        {/* Tier label badge */}
                        <div className="absolute top-3 right-3">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{
                                    background: `${cfg.accentColor}18`,
                                    border: `1px solid ${cfg.accentColor}35`,
                                    color: cfg.accentColor,
                                }}>
                                {cfg.label}
                            </span>
                        </div>

                        {isEditing ? (
                            /* ── EDIT MODE ──────────────────────────── */
                            <div className="p-6 space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest font-mono mb-3"
                                    style={{ color: cfg.accentColor }}>
                                    ✎ Editing Plan
                                </h3>

                                <input
                                    value={editData.display_name}
                                    onChange={(e) => setEditData((p) => ({ ...p, display_name: e.target.value }))}
                                    placeholder="Plan Name"
                                    className={cyberInput}
                                />
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                                    placeholder="Description"
                                    className={`${cyberInput} resize-none`}
                                    rows={2}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
                                            style={{ color: `${cfg.accentColor}80` }}>
                                            Harga/bulan
                                        </label>
                                        <input
                                            type="number" min="0"
                                            value={editData.price}
                                            onChange={(e) => setEditData((p) => ({ ...p, price: e.target.value }))}
                                            placeholder="Rp"
                                            className={cyberInput}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
                                            style={{ color: `${cfg.accentColor}80` }}>
                                            Diskon %
                                        </label>
                                        <input
                                            type="number" min="0" max="100" step="0.01"
                                            value={editData.discount_percentage}
                                            onChange={(e) => setEditData((p) => ({ ...p, discount_percentage: e.target.value }))}
                                            placeholder="%"
                                            className={cyberInput}
                                        />
                                    </div>
                                </div>

                                {/* Features editor */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2"
                                        style={{ color: `${cfg.accentColor}80` }}>
                                        Features
                                    </label>
                                    <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto pr-1"
                                        style={{ scrollbarWidth: 'thin', scrollbarColor: `${cfg.accentColor}40 transparent` }}>
                                        {editData.features?.map((feature, fi) => (
                                            <div key={fi} className="flex items-center justify-between px-3 py-2 rounded-lg gap-2"
                                                style={{
                                                    background: `${cfg.accentColor}0d`,
                                                    border: `1px solid ${cfg.accentColor}25`,
                                                }}>
                                                <span className="text-xs text-slate-300 flex-1 truncate">
                                                    ✓ {feature}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFeature(fi)}
                                                    className="text-xs font-black shrink-0 hover:opacity-70 transition-opacity"
                                                    style={{ color: '#f87171' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            value={newFeature}
                                            onChange={(e) => setNewFeature(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                                            placeholder="Tambah fitur..."
                                            className={`${cyberInput} flex-1`}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddFeature}
                                            className="px-4 py-2 rounded-xl text-black font-black text-sm shrink-0 cyber-btn"
                                            style={{
                                                background: `linear-gradient(135deg, ${cfg.accentColor}, ${cfg.accentColor}cc)`,
                                                boxShadow: `0 0 12px ${cfg.glowColor}`,
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Active toggle */}
                                <label className="flex items-center gap-3 cursor-pointer text-slate-400 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={editData.is_active}
                                        onChange={(e) => setEditData((p) => ({ ...p, is_active: e.target.checked }))}
                                        className="w-4 h-4 accent-cyan-400"
                                    />
                                    Aktif
                                </label>

                                {/* Action buttons */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-black text-black cyber-btn disabled:opacity-50"
                                        style={{
                                            background: `linear-gradient(135deg, ${cfg.accentColor}, ${cfg.accentColor}bb)`,
                                            boxShadow: `0 0 15px ${cfg.glowColor}`,
                                        }}
                                    >
                                        {saving ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2.5 rounded-xl text-sm font-black text-slate-400 cyber-btn"
                                        style={{ border: '1px solid rgba(100,116,139,0.25)', background: 'transparent' }}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── VIEW MODE ──────────────────────────── */
                            <div className="p-6">
                                {/* Plan name & price */}
                                <div className="mb-4 pr-16">
                                    <h3 className="text-xl font-black text-white">{plan.display_name}</h3>
                                    {plan.price > 0 ? (
                                        <p className="text-lg font-black mt-1" style={{ color: cfg.accentColor }}>
                                            Rp {Number(plan.price).toLocaleString('id-ID')}
                                            <span className="text-xs font-medium text-slate-500">/bulan</span>
                                        </p>
                                    ) : (
                                        <p className="text-lg font-black text-slate-400 mt-1">Gratis</p>
                                    )}
                                </div>

                                {/* Active badge */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                                        style={plan.is_active ? {
                                            background: 'rgba(16,185,129,0.12)',
                                            border: '1px solid rgba(16,185,129,0.25)',
                                            color: '#34d399',
                                        } : {
                                            background: 'rgba(100,116,139,0.1)',
                                            border: '1px solid rgba(100,116,139,0.2)',
                                            color: '#64748b',
                                        }}>
                                        {plan.is_active ? '● Aktif' : '○ Nonaktif'}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-400 mb-4">{plan.description}</p>

                                {plan.discount_percentage > 0 && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg mb-4 text-xs font-black"
                                        style={{
                                            background: `${cfg.accentColor}10`,
                                            border: `1px solid ${cfg.accentColor}25`,
                                            color: cfg.accentColor,
                                        }}>
                                        💰 Diskon {plan.discount_percentage}% untuk semua tiket
                                    </div>
                                )}

                                {/* Features list */}
                                <div className="mb-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2.5"
                                        style={{ color: `${cfg.accentColor}70` }}>
                                        Features
                                    </p>
                                    <ul className="space-y-1.5">
                                        {plan.features?.map((feature, fi) => (
                                            <li key={fi} className="text-sm text-slate-300 flex items-start gap-2">
                                                <span className="font-black mt-0.5 shrink-0" style={{ color: cfg.accentColor }}>✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {(!plan.features || plan.features.length === 0) && (
                                            <li className="text-xs text-slate-600 font-mono">// Tidak ada fitur</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Edit button */}
                                <button
                                    onClick={() => handleEdit(plan)}
                                    className="cyber-btn w-full py-2.5 rounded-xl text-sm font-black"
                                    style={{
                                        background: `${cfg.accentColor}0d`,
                                        border: `1px solid ${cfg.accentColor}30`,
                                        color: cfg.accentColor,
                                    }}
                                >
                                    ✎ Edit Plan
                                </button>
                            </div>
                        )}

                        {/* Bottom glow line */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${cfg.accentColor}40, transparent)` }} />
                    </motion.div>
                );
            })}
        </div>
    );
}
