import { useEffect, useState } from "react";
import { apiLeaderboard } from "../api.js";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiLeaderboard()
      .then(setRows)
      .catch((e) => setError(e.message || "Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card text-red-600">{error}</div>;

  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-primary mb-3">Leaderboard</h1>
      <div className="space-y-2">
        {rows.length === 0 && (
          <div className="text-sm text-neutral-600">No scores yet.</div>
        )}
        {rows.map((r, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border rounded-md px-3 py-2"
          >
            <div>{r.participant?.username}</div>
            <div className="font-semibold">{r.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
