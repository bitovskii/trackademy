'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserDiagnostics: React.FC = () => {
  const { user, token } = useAuth();

  return (
    <div className='space-y-6'>
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-lg font-semibold mb-4'>иагностика пользователя</h3>
        <p>ользователь: {user?.fullName}</p>
        <p>оль: {user?.role}</p>
      </div>
    </div>
  );
};

export default UserDiagnostics;
