import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRoundGraph } from "../api.js";
import cytoscape from "cytoscape";

export default function RoundGraph() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    apiRoundGraph(id)
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load graph"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // Destroy previous instance if re-rendering with new data
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    // Normalize and sanitize graph data
    const rawNodes = Array.isArray(data.nodes) ? data.nodes : [];
    const nodes = rawNodes.map((n) => ({
      data: {
        id: String(n.id),
        label: n?.data?.label ?? String(n.id),
      },
    }));
    const nodeIds = new Set(nodes.map((n) => n.data.id));

    const rawEdges = Array.isArray(data.edges) ? data.edges : [];
    const edges = rawEdges.map((e, idx) => ({
      data: {
        id: String(e.id ?? `e-${e.source}-${e.target}-${idx}`),
        source: String(e.source),
        target: String(e.target),
      },
    }));

    // Create placeholder nodes for any missing endpoints to prevent Cytoscape errors
    const missing = new Set();
    for (const ed of edges) {
      if (!nodeIds.has(ed.data.source)) missing.add(ed.data.source);
      if (!nodeIds.has(ed.data.target)) missing.add(ed.data.target);
    }
    if (missing.size) {
      console.warn(
        "Creating placeholder node(s) for missing ids:",
        Array.from(missing)
      );
    }
    const placeholderNodes = Array.from(missing).map((id) => ({
      data: { id, label: id, placeholder: true },
    }));

    const elements = [...nodes, ...placeholderNodes, ...edges];

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#3b82f6",
            "border-color": "#1e3a8a",
            "border-width": 1,
            label: "data(label)",
            color: "#0f172a",
            "font-size": 12,
            "text-valign": "center",
            "text-halign": "center",
            shape: "round-rectangle",
            padding: "8px",
            width: "label",
            height: "label",
          },
        },
        {
          selector: "node[placeholder]",
          style: {
            "background-color": "#fde68a",
            "border-color": "#f59e0b",
            "border-style": "dashed",
            color: "#7c2d12",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#9ca3af",
            "target-arrow-color": "#9ca3af",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
        {
          selector: ":selected",
          style: {
            "background-color": "#2563eb",
            "line-color": "#2563eb",
            "target-arrow-color": "#2563eb",
          },
        },
      ],
      layout: {
        name: "breadthfirst",
        directed: true,
        padding: 10,
        spacingFactor: 1.2,
        animate: true,
        fit: true,
      },
      wheelSensitivity: 0.2,
    });

    // Keep graph fitting on first render
    cyRef.current.fit();

    // Resize handler to keep it fitting when the container changes size
    const onResize = () => {
      if (!cyRef.current) return;
      cyRef.current.resize();
      cyRef.current.fit();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [data]);

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card text-red-600">{error}</div>;
  if (!data) return <div className="card">No graph data.</div>;

  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-primary mb-3">
        Delegation Graph
      </h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div
            ref={containerRef}
            className="h-[60vh] w-full rounded border border-gray-200 bg-white"
          />
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="font-medium mb-2">Participants</h2>
            <ul className="list-disc pl-5">
              {data.nodes?.map((n) => (
                <li key={n.id}>{n.data?.label ?? n.id}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
