import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  apiRegister,
  apiGetHostels,
  setToken,
  setUsername,
  setParticipantId,
} from "../api.js";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    hostel_id: "",
  });
  const [hostels, setHostels] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiGetHostels()
      .then(setHostels)
      .catch((err) => {
        setHostels([]);
        console.error("Failed to fetch hostels", err);
      });
  }, []);

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        ...(form.hostel_id
          ? { hostel_id: Number.parseInt(form.hostel_id, 10) }
          : {}),
      };
      const res = await apiRegister(payload);
      setToken(res.token);
      setUsername(res.user?.username || form.username);
      if (res.participant_id) setParticipantId(res.participant_id);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-xl font-semibold mb-4 text-primary">Register</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block mb-1">Username</label>
            <input
              className="input"
              value={form.username}
              onChange={(e) => onChange("username", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Hostel (optional)</label>
            <select
              className="input"
              value={form.hostel_id}
              onChange={(e) => onChange("hostel_id", e.target.value)}
            >
              <option value="">Select a hostel</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="btn btn-primary w-full" type="submit">
            Create Account
          </button>
        </form>
        <p className="mt-3 text-sm">
          Have an account?{" "}
          <Link className="text-primary" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
