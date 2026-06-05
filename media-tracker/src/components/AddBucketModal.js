import React, { useState } from 'react';
import { useBuckets } from '../core/context/BucketContext';

const categoryTheme = { Movie: 'bg-indigo-500', Drama: 'bg-rose-500', 'TV Show': 'bg-sky-500', Concert: 'bg-amber-500', 'Play/Musical': 'bg-violet-500', Exhibition: 'bg-emerald-500' };

export default function AddBucketModal({ onClose, editData }) {
  const { addToBucket, updateBucket } = useBuckets();
  const [movie, setMovie] = useState(editData ? editData : { title: '', poster_url: '', category: 'Movie', note: '', platform: '' });
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const API_KEY = '4de847a38f096b28a48cd6872369435a';

  const searchMovie = async (q) => {
    if (q.length < 2) return;
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}&language=ko-KR`);
    const data = await res.json();
    setResults(data.results || []);
    setShowResults(true);
  };

  const handleSave = async () => {
    if (!movie.title) return alert("제목을 입력해주세요!");
    if (editData) await updateBucket(editData.id, movie);
    else await addToBucket({ date: new Date().toISOString().split('T')[0], items: [{ ...movie }] });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm border shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase">{editData ? 'EDIT BUCKET' : 'ADD TO BUCKET'}</h2>
          <button onClick={onClose} className="text-[9px] text-gray-400">CLOSE</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="w-full h-80 bg-gray-100 flex items-center justify-center overflow-hidden">
            {movie.poster_url ? <img src={movie.poster_url} className="w-full h-full object-cover" alt="" /> : <span className="text-[10px] text-gray-400">NO IMAGE</span>}
          </div>
          <input className="w-full text-[14px] font-bold border-b pb-1" placeholder="Title" value={movie.title} onChange={(e) => { setMovie({...movie, title: e.target.value}); searchMovie(e.target.value); }} />
          {showResults && <div className="border max-h-32 overflow-y-auto">{results.map(m => <button key={m.id} className="block w-full p-2 text-[10px] border-b" onClick={() => { setMovie({...movie, title: m.title, poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : ''}); setShowResults(false); }}>{m.title}</button>)}</div>}
          <select className={`w-full text-[9px] text-white px-2 py-1 ${categoryTheme[movie.category]}`} value={movie.category} onChange={(e) => setMovie({...movie, category: e.target.value})}>{Object.keys(categoryTheme).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
          <input className="w-full text-[11px] border-b pb-1" placeholder="Platform" value={movie.platform} onChange={(e) => setMovie({...movie, platform: e.target.value})} />
          <textarea className="w-full text-[11px] border-b pb-1 h-20" placeholder="Note..." value={movie.note} onChange={(e) => setMovie({...movie, note: e.target.value})} />
        </div>
        <button onClick={handleSave} className="w-full py-4 text-[10px] uppercase text-white bg-gray-900">SAVE</button>
      </div>
    </div>
  );
}