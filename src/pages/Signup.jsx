import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    if (email && password) {
      alert("Signup successful! Please login.");
      navigate("/login");
    } else {
      alert("Please fill all fields.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-bg">
      <div className="w-full max-w-md p-8 bg-card rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>
        <form onSubmit={handleSignup}>
          <label className="block text-sm text-slate-400 mb-2">Email</label>
          <input
            className="w-full p-2 rounded-md bg-slate-900 mb-4"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block text-sm text-slate-400 mb-2">Password</label>
          <input
            type="password"
            className="w-full p-2 rounded-md bg-slate-900 mb-6"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-gradient-to-r from-primary to-accent text-slate-900"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-accent">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
