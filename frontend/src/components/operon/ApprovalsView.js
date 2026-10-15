"use client";

import React, { useState } from "react";
import {
  ShieldAlert, CheckCircle2, XCircle, Clock, Eye,
  ChevronRight, User, AlertTriangle, Code2, X,
} from "lucide-react";
// operonApi is available via props (onDecide) — no direct import needed

function RiskBadge({ level }) {
  const MAP = {
    HIGH:   "bg-red-500/10 border-red-500/20 text-red-400",
    MEDIUM: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    LOW:    "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${MAP[level] || MAP.LOW}`}>
      {level}
    </span>
  );
}

function ApprovalCard({ approval, onDecide }) {
  const [expanded, setExpanded] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [comment, setComment] = useState("");

  const handleDecide = async (decision) => {
    setDeciding(true);
    try {
      await onDecide(approval.id, decision, comment);
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden hover:border-slate-700 transition">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{approval.action_type}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{approval.description || "Agent requesting approval to perform action"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <RiskBadge level={approval.risk_level || "MEDIUM"} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Agent</p>
            <p className="text-xs font-medium text-slate-200 truncate">{approval.agent_name || approval.agent_id}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Requested</p>
            <p className="text-xs font-medium text-slate-200">{approval.created_at ? new Date(approval.created_at).toLocaleString() : "Just now"}</p>
          </div>
        </div>

        {/* Proposed action preview */}
        <button
          className="w-full text-left text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
          onClick={() => setExpanded(!expanded)}
        >
          <Code2 className="w-3.5 h-3.5" />
          {expanded ? "Hide" : "Show"} proposed action
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>

        {expanded && (
          <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-mono text-slate-400">Proposed Inputs</span>
            </div>
            <pre className="p-3 text-xs font-mono text-amber-300 overflow-auto max-h-40 leading-relaxed">
              {JSON.stringify(approval.proposed_inputs || {}, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Decision area */}
      <div className="border-t border-slate-800 p-4 bg-slate-900/30">
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Optional: add a note for the audit log…"
          rows={2}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 resize-none mb-3"
        />
        <div className="flex items-center gap-2">
          <button
            disabled={deciding}
            onClick={() => handleDecide("approved")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </button>
          <button
            disabled={deciding}
            onClick={() => handleDecide("rejected")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-medium transition disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalsView({
  approvals = [],
  loading = false,
  onDecide,
  onRefresh,
}) {
  const [filter, setFilter] = useState("pending");

  const filtered = approvals.filter(a => filter === "all" || a.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Human Approvals</h2>
          <p className="text-sm text-slate-400 mt-1">Review and authorize agent actions that require human oversight</p>
        </div>
        <div className="flex items-center gap-2">
          {["pending","approved","rejected","all"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filter === f
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">All clear!</h3>
          <p className="text-slate-400 text-sm">No {filter === "all" ? "" : filter} approvals to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(approval => (
            <ApprovalCard key={approval.id} approval={approval} onDecide={onDecide} />
          ))}
        </div>
      )}
    </div>
  );
}
