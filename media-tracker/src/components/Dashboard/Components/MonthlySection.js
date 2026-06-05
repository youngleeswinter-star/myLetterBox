// src/components/Dashboard/MonthlySection.jsx
export default function MonthlySection({ monthlyStats }) {
  const maxMonthly = Math.max(...monthlyStats.map(s => s[1]), 1);
  
  return (
    <div>
      <h2 className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-400 mb-8">Monthly</h2>
      <div className="space-y-6">
        {monthlyStats.map(([month, count]) => (
          <div key={month}>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[12px] font-light text-gray-900">{month}</span>
              <span className="text-[15px] font-medium text-gray-900">{count} Records</span>
            </div>
            <div className="w-full h-[2px] bg-gray-50">
              <div 
                className="h-full bg-gray-900 transition-all duration-500" 
                style={{ width: `${(count / maxMonthly) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}