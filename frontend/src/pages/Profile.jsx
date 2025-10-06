import { useEffect, useState } from "react";
import {
  apiGetProfile,
  apiGetHostels,
  apiUpdateProfileHostel,
  setParticipantId,
} from "../api.js";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [hostelId, setHostelId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiGetProfile()
      .then((p) => {
        setProfile(p);
        setParticipantId(p.id);
        setHostelId(p.hostel?.id || "");
      })
      .catch(() => {});
    apiGetHostels()
      .then(setHostels)
      .catch(() => {});
  }, []);

  const onSave = async () => {
    setStatus("");
    try {
      await apiUpdateProfileHostel(
        hostelId ? Number.parseInt(hostelId, 10) : null
      );
      setStatus("Saved!");
    } catch (err) {
      setStatus(err.message || "Failed to save");
    }
  };

  if (!profile) return <div className="card">Loading...</div>;

  return (
    <div className="max-w-xl">
      <div className="card">
        <h1 className="text-xl font-semibold text-primary mb-3">Profile</h1>
        <div className="grid gap-3">
          <div>
            <div className="text-sm text-neutral-600">Username</div>
            <div className="font-medium">{profile.user?.username}</div>
          </div>
          <div>
            <label className="block mb-1">Hostel</label>
            <select
              className="input"
              value={hostelId}
              onChange={(e) => setHostelId(e.target.value)}
            >
              <option value="">None</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary w-fit" onClick={onSave}>
            Save
          </button>
          {status && <div className="text-sm">{status}</div>}
        </div>
      </div>
    </div>
  );
}
