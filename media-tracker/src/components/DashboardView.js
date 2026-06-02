import React from 'react';

export default function DashboardView({ logs }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
          <h2 className="text-2xl font-black">{logs.length}</h2>
        </div>
        <div className="bg-gray-900 p-6 rounded-3xl text-white">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Monthly</p>
          <h2 className="text-2xl font-black">{logs.length > 0 ? 'Good' : 'Start!'}</h2>
        </div>
      </div>
    </div>
  );
}