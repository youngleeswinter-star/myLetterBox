export default function RatingChart({ distribution }) {
  const maxVal = Math.max(...Object.values(distribution), 1);
  return (
    <div className="flex items-end justify-between h-20 gap-4">
      {[1, 2, 3, 4, 5].map(s => (
        <div key={s} className="flex flex-col items-center flex-1 gap-3">
          <div className="w-full bg-gray-50 h-20 relative flex items-end">
            <div className="w-full bg-gray-900 transition-all duration-500" style={{ height: `${(distribution[s] / maxVal) * 100}%` }}></div>
          </div>
          <span className="text-[9px] text-gray-300 uppercase tracking-widest">{s}</span>
        </div>
      ))}
    </div>
  );
}