import { useEffect, useState } from "react";
import { apiGetDomains, apiGetProfile, apiGetSelfRatings } from "../api.js";
import { getParticipantId, apiPostSelfRatings } from "../api.js";

export default function SelfRatings() {
  const [domains, setDomains] = useState([]);
  const [selfRatings, setSelfRatings] = useState([]);
  const [participantId, setPid] = useState(getParticipantId());
  const [domainId, setDomainId] = useState("");
  const [rating, setRating] = useState(5);
  const [justification, setJustification] = useState("");
  const [status, setStatus] = useState("");

  const loadDomains = async () => {
    try {
      const d = await apiGetDomains();
      setDomains(d);
    } catch {
      setDomains([]);
    }
  };

  const loadSelfRatings = async () => {
    try {
      const list = await apiGetSelfRatings();
      setSelfRatings(list || []);
    } catch {
      setSelfRatings([]);
    }
  };

  useEffect(() => {
    loadDomains();
    loadSelfRatings();
    if (!participantId) {
      apiGetProfile()
        .then((p) => setPid(p.id))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!participantId) {
      setStatus("Missing participant id.");
      return;
    }
    try {
      await apiPostSelfRatings({
        participant: participantId,
        domain: Number.parseInt(domainId, 10),
        rating: Number(rating),
        justification,
      });
      setStatus("Submitted!");
      setDomainId("");
      setRating(5);
      setJustification("");
      await loadSelfRatings();
    } catch (err) {
      setStatus(err.message || "Failed to submit");
    }
  };

  const domainName = (id) =>
    domains.find((d) => d.id === id)?.name || `Domain #${id}`;

  return (
    <div className="max-w-xl">
      <div className="card">
        <h1 className="text-xl font-semibold text-primary mb-3">
          Self Ratings
        </h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block mb-1">Domain</label>
            <select
              className="input"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              required
            >
              <option value="">Select domain</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Rating (0-10)</label>
            <input
              className="input"
              type="number"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Justification</label>
            <textarea
              className="input"
              rows="4"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Submit Rating
          </button>
          {status && <div className="text-sm">{status}</div>}
        </form>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold mb-2">Your submitted ratings</h2>
        {selfRatings.length === 0 ? (
          <div className="text-sm text-muted">No ratings yet.</div>
        ) : (
          <ul className="space-y-2">
            {selfRatings.map((r) => (
              <li key={r.id} className="border rounded p-3 flex flex-col gap-1">
                <div className="font-medium">{domainName(r.domain)}</div>
                <div className="text-sm">Rating: {r.rating}</div>
                <div className="text-sm text-muted">{r.justification}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
