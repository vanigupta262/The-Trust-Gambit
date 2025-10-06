import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRounds } from "../api.js";

export default function Rounds() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiRounds()
      .then(setRounds)
      .catch((e) => setError(e.message || "Failed to load rounds"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card text-red-600">{error}</div>;

  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-primary mb-3">Rounds</h1>
      <div className="space-y-2">
        {rounds.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between border rounded-md px-3 py-2"
          >
            <div>
              <div className="font-medium">Round #{r.round_number}</div>
              <div className="text-sm text-neutral-600">{r.domain}</div>
            </div>
            <Link className="btn btn-secondary" to={`/rounds/${r.id}/graph`}>
              View Graph
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
