import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiLogin, setToken, setUsername } from "../api.js";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await apiLogin(username, password);
      setToken(res.token);
      setUsername(res.username);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-xl font-semibold mb-4 text-primary">Login</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block mb-1">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setU(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setP(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="btn btn-primary w-full" type="submit">
            Sign In
          </button>
        </form>
        <p className="mt-3 text-sm">
          No account?{" "}
          <Link className="text-primary" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
