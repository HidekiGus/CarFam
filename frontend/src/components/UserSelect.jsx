import React from 'react';

const UserSelect = ({ users, activeUser, onSelect, isMobile }) => {
  if (!activeUser || users.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
      <span className="text-gray-500 font-medium">Motorista:</span>
      <select 
        value={activeUser.id}
        onChange={(e) => {
          const u = users.find(u => String(u.id) === String(e.target.value));
          if(u) onSelect(u);
        }}
        className="bg-gray-100 border border-gray-200 text-gray-800 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium cursor-pointer"
      >
        {users.map(u => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </div>
  );
};

export default UserSelect;
