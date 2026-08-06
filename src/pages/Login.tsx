import React, { useState } from 'react';
import { supabase } from '../lib/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (error) throw error;
      // Redirect to dashboard or main page
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <h2 class="text-center text-emerald-200 my-8">Login</h2>
      <form className="max-w-xs mx-auto p-4 bg-white rounded shadow" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mt-2"
        />
        {error && <p class="text-red-500 text-center mt-2">{error}</p>
        <button
          type="submit"
          className="w-full bg-emerald-500 text-white px-4 py-2 rounded mt-2"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
