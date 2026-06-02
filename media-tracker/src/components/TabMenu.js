import React from 'react';

export default function TabMenu({ activeTab, setActiveTab }) {
  return (
    <div className="tab-menu">
      <button 
        onClick={() => setActiveTab('calendar')} 
        className={activeTab === 'calendar' ? 'active' : ''}
      >캘린더</button>
      <button 
        onClick={() => setActiveTab('dashboard')} 
        className={activeTab === 'dashboard' ? 'active' : ''}
      >대시보드</button>
    </div>
  );
}