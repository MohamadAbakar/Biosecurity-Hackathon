import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { peptidesAPI } from '../../services/api';

const PeptideSearch = ({ onSearch }) => {
  const [name, setName] = useState('');
  const [sequence, setSequence] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    peptidesAPI.getCategories().then((res) => setCategories(res.categories || [])).catch(() => {});
  }, []);

  const handleSearch = () => onSearch({ name, sequence, category, page: 1 });

  const handleClear = () => {
    setName(''); setSequence(''); setCategory('');
    onSearch({ page: 1 });
  };

  const hasFilters = name || sequence || category;

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 180px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: 4 }}>Name</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Oxytocin…" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
      </div>
      <div style={{ flex: '1 1 180px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: 4 }}>Sequence</label>
        <input className="form-input" value={sequence} onChange={(e) => setSequence(e.target.value)}
          placeholder="CYIQNCPLG…" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} style={{ fontFamily: 'var(--font-mono)' }} />
      </div>
      <div style={{ flex: '0 1 140px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: 4 }}>Category</label>
        <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <button className="btn btn-primary" onClick={handleSearch} style={{ alignSelf: 'flex-end' }}>
        <Search size={15} /> Search
      </button>
      {hasFilters && (
        <button className="btn btn-ghost" onClick={handleClear} style={{ alignSelf: 'flex-end' }}>
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
};

export default PeptideSearch;
