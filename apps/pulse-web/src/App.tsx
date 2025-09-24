import React from 'react';
import { useEffect, useState } from 'react';
import { api } from './lib/api';

export function App() {
  const [health, setHealth] = useState<string>('checking...');

  useEffect(() => {
    api
      .get('/health')
      .then((r) => setHealth(JSON.stringify(r.data)))
      .catch((e) => setHealth(`error: ${e?.message ?? 'unknown'}`));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">ClubDuty Pulse</h1>
      <p className="text-gray-600">Vite + React 19 + Tailwind + DaisyUI scaffold</p>
      <div className="mt-4">
        <span className="badge badge-outline">API</span>
        <span className="ml-2">{health}</span>
      </div>
      <button className="btn btn-primary btn-soft mt-4">Hallo</button>
    </div>
  );
}
