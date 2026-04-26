import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const dangerBadge = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-blue-100 text-blue-700',
  safe:     'bg-green-100 text-green-700',
  unknown:  'bg-purple-100 text-purple-700',
};

const DANGER_LEVELS = ['safe', 'low', 'medium', 'high', 'critical', 'unknown'];

const emptyForm = {
  name: '', sequence: '', molecularWeight: '', chemicalFormula: '',
  classification: '', dangerLevel: 'safe', description: '', referenceSpectrum: [],
};

const inputCls = `w-full px-3 py-2 text-sm bg-background border border-input rounded-md
  text-foreground placeholder:text-muted-foreground
  focus:outline-none focus:ring-2 focus:ring-ring transition-shadow`;

const Label = ({ children }) => (
  <label className="block text-xs font-medium text-foreground mb-1.5">{children}</label>
);

const PeptideDatabase = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [dangerFilter, setDanger] = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState(emptyForm);

  const params = new URLSearchParams({ page, limit: 20 });
  if (search)       params.set('search',      search);
  if (dangerFilter) params.set('dangerLevel',  dangerFilter);

  const { data, isLoading } = useQuery({
    queryKey: ['peptides', page, search, dangerFilter],
    queryFn:  () => api.get(`/peptides?${params}`),
    keepPreviousData: true,
  });

  const peptides   = data?.data?.data       || [];
  const pagination = data?.data?.pagination || {};

  const saveMutation = useMutation({
    mutationFn: (body) =>
      editTarget ? api.put(`/peptides/${editTarget.id}`, body) : api.post('/peptides', body),
    onSuccess: () => {
      toast.success(editTarget ? 'Peptide updated' : 'Peptide created');
      queryClient.invalidateQueries(['peptides']);
      setShowForm(false); setEditTarget(null); setForm(emptyForm);
    },
    onError: () => toast.error('Failed to save peptide'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/peptides/${id}`),
    onSuccess: () => { toast.success('Peptide deleted'); queryClient.invalidateQueries(['peptides']); },
    onError:   () => toast.error('Failed to delete peptide'),
  });

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      name:             p.name              || '',
      sequence:         p.sequence          || '',
      molecularWeight:  p.molecular_weight  || '',
      chemicalFormula:  p.chemical_formula  || '',
      classification:   p.classification    || '',
      dangerLevel:      p.danger_level      || 'safe',
      description:      p.description       || '',
      referenceSpectrum: p.reference_spectrum || [],
    });
    setShowForm(true);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Peptide Database</h1>
        {isAdmin && (
          <button
            onClick={() => { setEditTarget(null); setForm(emptyForm); setShowForm(true); }}
            className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-md
                       hover:opacity-90 transition-opacity"
          >
            + Add Peptide
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-card border border-border rounded-lg shadow-card px-4 py-3 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name, sequence, description…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className={`flex-1 min-w-48 ${inputCls}`}
        />
        <select
          value={dangerFilter}
          onChange={e => { setDanger(e.target.value); setPage(1); }}
          className={`w-44 ${inputCls}`}
        >
          <option value="">All danger levels</option>
          {DANGER_LEVELS.map(l => (
            <option key={l} value={l} className="capitalize">{l}</option>
          ))}
        </select>
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Loading…</div>
        ) : peptides.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">No peptides found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {['Name', 'Sequence', 'Classification', 'MW', 'Danger Level', isAdmin ? 'Actions' : ''].filter(Boolean).map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-medium text-muted-foreground uppercase tracking-wide text-[11px]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {peptides.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground max-w-[200px] truncate">{p.sequence}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.classification || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                      {p.molecular_weight ? Number(p.molecular_weight).toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md font-medium capitalize ${
                        dangerBadge[p.danger_level] ?? dangerBadge.safe
                      }`}>
                        {p.danger_level}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => { if (window.confirm('Delete this peptide?')) deleteMutation.mutate(p.id); }}
                            className="text-[11px] font-medium text-destructive hover:opacity-80 transition-opacity"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-[11px] text-muted-foreground">
              {pagination.total} total · page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 text-xs border border-border rounded-md
                           hover:bg-muted disabled:opacity-40 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="px-2.5 py-1 text-xs border border-border rounded-md
                           hover:bg-muted disabled:opacity-40 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl shadow-card-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {editTarget ? 'Edit Peptide' : 'Add Peptide'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground
                           hover:bg-muted hover:text-foreground transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="p-5 space-y-4">
              {[
                { label: 'Name *',           key: 'name',            required: true },
                { label: 'Sequence *',       key: 'sequence',        required: true },
                { label: 'Molecular Weight', key: 'molecularWeight' },
                { label: 'Chemical Formula', key: 'chemicalFormula' },
                { label: 'Classification',   key: 'classification'  },
              ].map(({ label, key, required }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <input
                    type="text" value={form[key]} required={required}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              ))}

              <div>
                <Label>Danger Level</Label>
                <select
                  value={form.dangerLevel}
                  onChange={e => setForm(f => ({ ...f, dangerLevel: e.target.value }))}
                  className={inputCls}
                >
                  {DANGER_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                </select>
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-1.5 text-xs border border-border rounded-md
                             hover:bg-muted transition-colors text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saveMutation.isPending}
                  className="px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded-md
                             hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saveMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeptideDatabase;
