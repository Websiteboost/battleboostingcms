'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { Tag, Plus, Trash2, Pencil, Check, X, Copy, ToggleLeft, ToggleRight, Percent, DollarSign, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  toggleDiscountActive,
  deleteDiscount,
  type DiscountCode,
} from '@/app/actions/discounts';
import { AdminGuard } from '@/components/guards/AdminGuard';

type FormState = {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: string;
  active: boolean;
  expires_at: string;
};

const EMPTY_FORM: FormState = {
  code: '',
  discount_type: 'percent',
  discount_value: '',
  active: true,
  expires_at: '',
};

function formatExpiresAt(dateStr: string | null) {
  if (!dateStr) return '—';
  const iso = new Date(dateStr).toISOString().slice(0, 10); // YYYY-MM-DD
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function DescuentosContent() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getDiscounts();
    if (res.success && res.data) setDiscounts(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (d: DiscountCode) => {
    setEditingId(d.id);
    setForm({
      code: d.code,
      discount_type: d.discount_type,
      discount_value: String(d.discount_value),
      active: d.active,
      expires_at: d.expires_at ? new Date(d.expires_at).toISOString().slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(form.discount_value);
    if (isNaN(value) || value <= 0) {
      toast.error('El valor del descuento debe ser mayor que 0');
      return;
    }
    if (form.discount_type === 'percent' && value > 100) {
      toast.error('El porcentaje no puede superar 100');
      return;
    }

    const payload = {
      code: form.code.toUpperCase().trim(),
      discount_type: form.discount_type,
      discount_value: value,
      active: form.active,
      expires_at: form.expires_at || null,
    };

    startTransition(async () => {
      const res = editingId
        ? await updateDiscount(editingId, payload)
        : await createDiscount(payload);

      if (res.success) {
        toast.success(editingId ? 'Descuento actualizado' : 'Descuento creado');
        closeForm();
        load();
      } else {
        toast.error(res.error || 'Error al guardar');
      }
    });
  };

  const handleToggle = async (d: DiscountCode) => {
    setTogglingId(d.id);
    const res = await toggleDiscountActive(d.id, !d.active);
    if (res.success) {
      setDiscounts(prev => prev.map(x => x.id === d.id ? { ...x, active: !x.active } : x));
      toast.success(d.active ? 'Descuento desactivado' : 'Descuento activado');
    } else {
      toast.error(res.error || 'Error al cambiar estado');
    }
    setTogglingId(null);
  };

  const handleDelete = async (d: DiscountCode) => {
    if (!confirm(`¿Eliminar el código "${d.code}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(d.id);
    const res = await deleteDiscount(d.id);
    if (res.success) {
      setDiscounts(prev => prev.filter(x => x.id !== d.id));
      toast.success('Código eliminado');
    } else {
      toast.error(res.error || 'Error al eliminar');
    }
    setDeletingId(null);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Código "${code}" copiado`);
  };

  const filtered = discounts.filter(d =>
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: discounts.length,
    active: discounts.filter(d => d.active && !isExpired(d.expires_at)).length,
    expired: discounts.filter(d => isExpired(d.expires_at)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyber-purple/20 rounded-xl border border-cyber-purple/30">
            <Tag size={22} className="text-cyber-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Descuentos</h1>
            <p className="text-xs text-gray-400">Gestiona códigos de descuento consultables vía API</p>
          </div>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus size={16} className="mr-2" />
          Nuevo Código
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-300', bg: 'bg-slate-800/50' },
          { label: 'Activos', value: stats.active, color: 'text-cyber-green', bg: 'bg-cyber-green/10 border-cyber-green/30' },
          { label: 'Expirados', value: stats.expired, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-slate-700 p-3 text-center ${s.bg}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por código..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-purple transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-cyber-purple/40 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Editar Código' : 'Nuevo Código de Descuento'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Código */}
              <div>
                <Input
                  label="Código"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="Ej: VERANO25, BLACK10"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Solo mayúsculas, números, - y _</p>
              </div>

              {/* Tipo */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-medium text-gray-200">Tipo de descuento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, discount_type: 'percent' }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.discount_type === 'percent'
                        ? 'bg-cyber-purple/20 border-cyber-purple text-white'
                        : 'border-slate-700 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <Percent size={15} /> Porcentaje
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, discount_type: 'fixed' }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.discount_type === 'fixed'
                        ? 'bg-cyber-purple/20 border-cyber-purple text-white'
                        : 'border-slate-700 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <DollarSign size={15} /> Monto fijo
                  </button>
                </div>
              </div>

              {/* Valor */}
              <Input
                label={form.discount_type === 'percent' ? 'Porcentaje (%)' : 'Monto fijo (USD)'}
                type="number"
                min="0.01"
                max={form.discount_type === 'percent' ? '100' : undefined}
                step="0.01"
                value={form.discount_value}
                onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                placeholder={form.discount_type === 'percent' ? 'Ej: 25' : 'Ej: 10.00'}
                required
              />

              {/* Expiración */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-200">
                  <Clock size={13} /> Fecha de expiración <span className="text-gray-500">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-cyber-purple/30 rounded-lg text-sm text-white focus:outline-none focus:border-cyber-purple transition-colors cursor-pointer"
                />
              </div>

              {/* Activo */}
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-200">Estado inicial</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.active
                      ? 'bg-cyber-green/10 border-cyber-green/40 text-cyber-green'
                      : 'bg-slate-800 border-slate-600 text-gray-400'
                  }`}
                >
                  {form.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {form.active ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={closeForm} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Código')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-slate-800/40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Tag size={40} className="mx-auto text-gray-600" />
          <p className="text-gray-400">{search ? 'Sin resultados para tu búsqueda' : 'No hay códigos de descuento aún'}</p>
          {!search && (
            <Button onClick={openCreate} variant="secondary">
              <Plus size={15} className="mr-2" /> Crear primer código
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop: tabla */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Descuento</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Expira</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(d => {
                  const expired = isExpired(d.expires_at);
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-cyber-cyan text-sm">{d.code}</code>
                          <button onClick={() => handleCopy(d.code)} className="text-gray-500 hover:text-cyber-cyan transition-colors" title="Copiar">
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-semibold ${d.discount_type === 'percent' ? 'text-cyber-purple' : 'text-cyber-green'}`}>
                          {d.discount_type === 'percent' ? <Percent size={13} /> : <DollarSign size={13} />}
                          {d.discount_value}{d.discount_type === 'percent' ? '%' : ' USD'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(d)}
                          disabled={togglingId === d.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                            expired
                              ? 'bg-red-500/10 border-red-500/30 text-red-400'
                              : d.active
                                ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green hover:bg-cyber-green/20'
                                : 'bg-slate-700 border-slate-600 text-gray-400 hover:border-slate-500'
                          }`}
                        >
                          {expired ? 'Expirado' : d.active ? <><ToggleRight size={13} />Activo</> : <><ToggleLeft size={13} />Inactivo</>}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatExpiresAt(d.expires_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-slate-700 rounded-lg text-gray-400 hover:text-white transition-colors" title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(d)}
                            disabled={deletingId === d.id}
                            className="p-1.5 hover:bg-red-900/40 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(d => {
              const expired = isExpired(d.expires_at);
              return (
                <div key={d.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <code className="font-mono font-bold text-cyber-cyan text-base truncate">{d.code}</code>
                      <button onClick={() => handleCopy(d.code)} className="text-gray-500 hover:text-cyber-cyan transition-colors shrink-0">
                        <Copy size={13} />
                      </button>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-slate-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(d)}
                        disabled={deletingId === d.id}
                        className="p-1.5 hover:bg-red-900/40 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1 font-semibold text-sm ${d.discount_type === 'percent' ? 'text-cyber-purple' : 'text-cyber-green'}`}>
                      {d.discount_type === 'percent' ? <Percent size={13} /> : <DollarSign size={13} />}
                      {d.discount_value}{d.discount_type === 'percent' ? '%' : ' USD'}
                    </span>
                    <button
                      onClick={() => handleToggle(d)}
                      disabled={togglingId === d.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        expired
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : d.active
                            ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green'
                            : 'bg-slate-700 border-slate-600 text-gray-400'
                      }`}
                    >
                      {expired ? 'Expirado' : d.active ? <><ToggleRight size={13} />Activo</> : <><ToggleLeft size={13} />Inactivo</>}
                    </button>
                  </div>

                  {d.expires_at && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={11} /> Expira: {formatExpiresAt(d.expires_at)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Cómo funcionan los descuentos */}
      <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs text-gray-400 space-y-2">
        <p className="font-semibold text-gray-300 text-sm">¿Cómo funcionan los descuentos?</p>
        <ul className="space-y-1.5 list-none">
          <li><span className="text-cyber-purple font-medium">Porcentaje (%):</span> reduce el precio total en ese porcentaje. Ej: 20% sobre $100 → $80.</li>
          <li><span className="text-cyber-cyan font-medium">Monto fijo (USD):</span> resta una cantidad fija al precio. Ej: $15 sobre $100 → $85.</li>
          <li><span className="text-gray-300 font-medium">Fecha de expiración:</span> pasada esa fecha el código deja de funcionar automáticamente, sin necesidad de desactivarlo.</li>
          <li><span className="text-gray-300 font-medium">Estado activo/inactivo:</span> puedes desactivar un código temporalmente sin borrarlo, para reactivarlo más tarde.</li>
        </ul>
      </div>
    </div>
  );
}

export default function DescuentosPage() {
  return (
    <AdminGuard>
      <DescuentosContent />
    </AdminGuard>
  );
}
