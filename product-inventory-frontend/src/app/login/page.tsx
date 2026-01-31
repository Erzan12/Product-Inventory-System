// app/login/page.tsx (if you're using Next.js App Router)
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const text = await response.text(); // fallback to see HTML or error
        console.error('Login failed:', text);
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      alert('Login successful!');
      router.push('/'); // redirect to homepage
    } catch (error) {
      console.error(error);
      alert('Login failed. Check your credentials.');
    }
  };

  return (
    <main className="max-w-md mx-auto py-10">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input
        className="border p-2 w-full mb-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 w-full rounded"
      >
        Log In
      </button>
    </main>
  );
}
