import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authenticateUser } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter valid credentials!");
      return;
    }

    try {
      setLoading(true);
      const userData = await authenticateUser(email, password);
      console.log("Login successful:", userData);
      navigate("/"); // Redirect to dashboard
    } catch (error) {
      alert(error.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-bg">
      <div className="w-full max-w-md p-8 bg-card rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Sign in to Synquerra</h2>

        <form onSubmit={handleLogin}>
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
            disabled={loading}
            className={`w-full py-2 rounded-md bg-gradient-to-r from-primary to-accent text-slate-900 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-slate-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-accent">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
