"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bot,
  Play,
  Pause,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  Database,
  Server,
  Activity,
  Sliders,
  Sparkles,
  Shield,
  Clock,
  ChevronRight,
  RefreshCw,
  Zap,
} from "lucide-react";
import { operonApi } from "../../api/operon";

const TEMPLATE_META = {
  customer_support: { label: "Customer Support", color: "from-blue-600 to-cyan-600", badge: "bg-blue-50 text-blue-700", icon: "🎧" },
  sales:            { label: "Sales Agent",      color: "from-purple-600 to-pink-600", badge: "bg-purple-50 text-purple-700", icon: "📈" },
  operations:       { label: "Operations Agent", color: "from-amber-600 to-orange-600", badge: "bg-amber-50 text-amber-700", icon: "⚙️" },
};

export default function AgentDetailView({
  agent,
  onTriggerRun,
  onOpenRun,
  onBack,
  onRefresh,
}) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | runs | integrations | knowledge | tools | config
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });

  // Config tab form state
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    instructions: "",
    business_hours: "24/7",
    escalation_contact: "",
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchDetails = async () => {
    if (!agent?.id) return;
    setLoading(true);
    try {
      const data = await operonApi.agents.getAgentDetails(agent.id);
      setDetails(data);
      setEditForm({
        name: data.name || "",
        description: data.description || "",
        instructions: data.instructions || "",
        business_hours: data.business_rules?.business_hours || "24/7",
        escalation_contact: data.escalation_rules?.contact || "support-lead@acme.com",
      });
    } catch (err) {
      setFeedbackMsg({ text: err.message || "Failed to load agent details.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [agent?.id]);

  const handleTogglePause = async () => {
    if (!details) return;
    setActionLoading(true);
    try {
      if (details.status === "active") {
        await operonApi.agents.pauseAgent(details.id);
        setFeedbackMsg({ text: `Agent '${details.name}' has been paused.`, type: "success" });
      } else {
        await operonApi.agents.activateAgent(details.id);
        setFeedbackMsg({ text: `Agent '${details.name}' is now active!`, type: "success" });
      }
      await fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      setFeedbackMsg({ text: err.message || "Failed to update agent status.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete agent "${details.name}"?`)) return;
    setActionLoading(true);
    try {
      await operonApi.agents.deleteAgent(details.id);
      if (onRefresh) onRefresh();
      if (onBack) onBack();
    } catch (err) {
      setFeedbackMsg({ text: err.message || "Failed to delete agent.", type: "error" });
      setActionLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setFeedbackMsg({ text: "", type: "" });
    try {
      await operonApi.agents.updateAgent(details.id, {
        name: editForm.name,
        description: editForm.description,
        instructions: editForm.instructions,
        business_rules: {
          ...details.business_rules,
          business_hours: editForm.business_hours,
        },
        escalation_rules: {
          ...details.escalation_rules,
          contact: editForm.escalation_contact,
        },
      });
      setFeedbackMsg({ text: "Agent configuration updated and version bumped successfully.", type: "success" });
      await fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      setFeedbackMsg({ text: err.message || "Failed to update configuration.", type: "error" });
    } finally {
      setSavingConfig(false);
    }
  };

  const meta = TEMPLATE_META[agent?.template_key] || TEMPLATE_META.customer_support;
  const currentAgent = details || agent;
  const isActive = currentAgent?.status === "active";

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Back to agents list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md">
            {meta.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentAgent?.name}</h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {isActive ? "Active" : "Paused"}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                v{currentAgent?.current_version_number || 1}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{meta.label} Archetype</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerRun && onTriggerRun(currentAgent)}
            disabled={!isActive || actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5" />
            Trigger Run
          </button>

          <button
            onClick={handleTogglePause}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-600" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                Resume
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedbackMsg.text && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedbackMsg.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: "overview", label: "Overview", icon: Bot },
          { id: "runs", label: `Run History (${details?.recent_runs?.length || 0})`, icon: Activity },
          { id: "integrations", label: "Integrations", icon: Layers },
          { id: "knowledge", label: "Knowledge & Data", icon: Database },
          { id: "tools", label: "Tools & MCP", icon: Server },
          { id: "config", label: "Configuration", icon: Sliders },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
                activeTab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs text-slate-500">Current Status</span>
              <div className="text-xl font-bold text-slate-900 mt-1 capitalize">{currentAgent?.status}</div>
              <p className="text-[11px] text-slate-400 mt-1">Tenant isolation enforced</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs text-slate-500">Active Version</span>
              <div className="text-xl font-bold text-blue-600 mt-1">v{currentAgent?.current_version_number || 1}</div>
              <p className="text-[11px] text-slate-400 mt-1">Immutable execution version</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs text-slate-500">Recent Runs</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{details?.recent_runs?.length || 0}</div>
              <p className="text-[11px] text-slate-400 mt-1">Last 10 execution cycles</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs text-slate-500">Branch Scopes</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">{details?.branches?.length || 1}</div>
              <p className="text-[11px] text-slate-400 mt-1">Authorized business branches</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Operating Instructions</h3>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
              {details?.instructions || "No custom instructions specified."}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500">Business Hours:</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {details?.business_rules?.business_hours || "24/7 Continuous Operation"}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Escalation Channel / Contact:</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {details?.escalation_rules?.contact || "support-lead@acme.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Runs */}
      {activeTab === "runs" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {!details?.recent_runs || details.recent_runs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No recent runs recorded for this agent.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Run ID</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold">Started At</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {details.recent_runs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{r.id}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {r.latency_ms ? `${(r.latency_ms / 1000).toFixed(2)}s` : "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenRun && onOpenRun(r)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-white text-slate-600 text-[11px] font-medium"
                      >
                        View Trace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Integrations */}
      {activeTab === "integrations" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Connected System Integrations</h3>
          <p className="text-xs text-slate-500">
            Authorized inbound channels and external notification systems configured for this agent.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {["Email & SMTP Gateway", "Zendesk Ticketing API", "Internal Slack Alerts (#incident-room)"].map(
              (item, i) => (
                <div key={i} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {item.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{item}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Tab: Knowledge & Data */}
      {activeTab === "knowledge" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Knowledge Boundaries & Database Access</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-800 block">Retrieval Pipeline</span>
                <span className="text-slate-500 text-[11px]">Sparse BM25 + Dense pgvector Cross-Encoder</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                Hybrid RAG
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-semibold text-slate-800 block">Allowlisted Tables Sandbox</span>
              <div className="flex flex-wrap gap-1.5">
                {["customers", "orders", "tickets", "products"].map((tbl) => (
                  <span key={tbl} className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700">
                    {tbl} (Read-Only)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tools & MCP */}
      {activeTab === "tools" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Enabled Tools & MCP Capabilities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "search_knowledge", desc: "Retrieve policy docs & FAQs via BM25 + pgvector", type: "Read" },
              { name: "check_order", desc: "Query orders table for transaction & status lookup", type: "Read" },
              { name: "query_approved_database", desc: "Execute sandboxed SQL on allowlisted schema", type: "Read" },
              { name: "request_refund", desc: "Propose credit refund to customer account", type: "Approval Gate" },
            ].map((t, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-900">{t.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 font-medium text-slate-700">
                    {t.type}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Configuration */}
      {activeTab === "config" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs max-w-2xl">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Agent Name</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Description</label>
              <textarea
                rows={2}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">System Instructions</label>
              <textarea
                rows={5}
                required
                value={editForm.instructions}
                onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Business Hours</label>
                <input
                  type="text"
                  value={editForm.business_hours}
                  onChange={(e) => setEditForm({ ...editForm, business_hours: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Escalation Contact</label>
                <input
                  type="email"
                  value={editForm.escalation_contact}
                  onChange={(e) => setEditForm({ ...editForm, escalation_contact: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingConfig}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium shadow-sm transition"
              >
                <Save className="w-3.5 h-3.5" />
                {savingConfig ? "Saving Changes..." : "Save & Create Version"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
