import { useEffect, useState } from "react";
import { apiCurrentRound, apiSubmitAction } from "../api.js";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [round, setRound] = useState(null);
  const [delegationTargets, setDelegationTargets] = useState([]);

  const [actionType, setActionType] = useState("SOLVE");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [delegatedTo, setDelegatedTo] = useState("");

  useEffect(() => {
    setLoading(true);
    apiCurrentRound()
      .then((res) => {
        setRound(res.current_round);
        setDelegationTargets(res.delegation_targets || []);
      })
      .catch((err) => setError(err.message || "Failed to load round"))
      .finally(() => setLoading(false));
  }, []);

  const onSubmitAction = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { action_type: actionType };
    if (actionType === "SOLVE") payload.submitted_answer = submittedAnswer;
    if (actionType === "DELEGATE")
      payload.delegated_to = delegatedTo
        ? Number.parseInt(delegatedTo, 10)
        : null;
    try {
      await apiSubmitAction(payload);
      alert("Action submitted!");
    } catch (err) {
      setError(err.message || "Failed to submit action");
    }
  };

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card text-red-600">{error}</div>;
  if (!round) return <div className="card">No active round at the moment.</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card">
        <h2 className="text-lg font-semibold text-primary mb-2">
          Current Round
        </h2>
        <div className="text-sm text-neutral-600">
          Round #{round.round_number}
        </div>
        <div className="mt-2">
          <div className="font-medium">Domain</div>
          <div>{round.domain}</div>
        </div>
        <div className="mt-3">
          <div className="font-medium">Question</div>
          <div className="text-pretty">{round.question_text}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-primary mb-3">
          Submit Action
        </h2>
        <form onSubmit={onSubmitAction} className="space-y-3">
          <div>
            <label className="block mb-1">Action Type</label>
            <select
              className="input"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
            >
              <option value="SOLVE">Solve</option>
              <option value="DELEGATE">Delegate</option>
              <option value="PASS">Pass</option>
            </select>
          </div>

          {actionType === "SOLVE" && (
            <div>
              <label className="block mb-1">Answer</label>
              <input
                className="input"
                value={submittedAnswer}
                onChange={(e) => setSubmittedAnswer(e.target.value)}
                placeholder="Type your answer"
              />
            </div>
          )}

          {actionType === "DELEGATE" && (
            <div>
              <label className="block mb-1">Delegate To</label>
              <select
                className="input"
                value={delegatedTo}
                onChange={(e) => setDelegatedTo(e.target.value)}
              >
                <option value="">Select participant</option>
                {delegationTargets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="btn btn-primary w-full">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
