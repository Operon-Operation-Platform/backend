"use client";

import React, { useState, useEffect } from "react";
import {
  Server, Wrench, Plus, CheckCircle2, XCircle, Search,
  ExternalLink, Shield, ToggleLeft, ToggleRight,
  Plug, Code2, ChevronRight, ChevronDown, Copy,
  Loader2, AlertTriangle, Zap, Globe,
} from "lucide-react";

const TOOL_CATEGORIES = {
  builtin:     { label: "Built-in",     color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20" },
  integration: { label: "Integration",  color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  mcp:         { label: "MCP Server",   color: "text-rose-400",   bg: "bg-rose-500/10 border-rose-500/20" },
  custom:      { label: "Custom",       color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
};

function CategoryBadge({ category }) {
  const cfg = TOOL_CATEGORIES[category] || TOOL_CATEGORIES.builtin;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function ToolCard({ tool, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const isEnabled = tool.enabled !== false;

  return (
    <div className={`bg-slate-900/60 border rounded-2xl overflow-hidden transition ${isEnabled ? "border-slate-800/60 hover:border-slate-700" : "border-slate-800/30 opacity-60"}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isEnabled ? "bg-slate-800" : "bg-slate-900"}`}>
              <Wrench className={`w-4 h-4 ${isEnabled ? "text-cyan-400" : "text-slate-600"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white">{tool.name}</h3>
                <CategoryBadge category={tool.category} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{tool.description}</p>
            </div>
          </div>
          <button
            onClick={() => onToggle && onToggle(tool)}
            className="flex-shrink-0 ml-2"
            title={isEnabled ? "Disable" : "Enable"}
          >
            {isEnabled
              ? <ToggleRight className="w-7 h-7 text-emerald-400" />
              : <ToggleLeft className="w-7 h-7 text-slate-600" />
            }
          </button>
        </div>

        {tool.requires_approval && (
          <div className="flex items-center gap-1.5 mt-2 text-amber-400 text-[11px] font-medium">
            <Shield className="w-3 h-3" /> Requires human approval
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
        >
          <Code2 className="w-3.5 h-3.5" />
          {expanded ? "Hide" : "View"} schema
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {expanded && tool.input_schema && (
          <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <pre className="p-3 text-[11px] font-mono text-emerald-300 overflow-auto max-h-36 leading-relaxed">
              {JSON.stringify(tool.input_schema, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function McpServerCard({ server, onConnect, onDisconnect }) {
  const isConnected = server.status === "connected";
  return (
    <div className={`bg-slate-900/60 border rounded-2xl p-5 transition ${isConnected ? "border-emerald-500/20 hover:border-emerald-500/30" : "border-slate-800/60 hover:border-slate-700"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? "bg-emerald-500/10" : "bg-slate-800"}`}>
            <Server className={`w-5 h-5 ${isConnected ? "text-emerald-400" : "text-slate-500"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">{server.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[200px]">{server.url || server.transport}</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isConnected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-700/50 text-slate-400 border border-slate-700"}`}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3 mb-3">
        <span className="text-xs text-slate-400">{server.tools_count ?? "—"} tools discovered</span>
        {server.protocol && <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{server.protocol}</span>}
      </div>

      <div className="flex gap-2">
        {isConnected ? (
          <button
            onClick={() => onDisconnect && onDisconnect(server)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 text-xs font-medium transition"
          >
            <XCircle className="w-3.5 h-3.5" /> Disconnect
          </button>
        ) : (
          <button
            onClick={() => onConnect && onConnect(server)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 text-xs font-medium transition"
          >
            <Plug className="w-3.5 h-3.5" /> Connect
          </button>
        )}
      </div>
    </div>
  );
}

function RequestToolModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", system: "", description: "", inputs: "", expected_output: "" });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-lg">Request a New Tool</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {[
            { key: "name",            label: "Tool Name",         placeholder: "e.g. check_inventory" },
            { key: "system",          label: "Target System",     placeholder: "e.g. Shopify, SAP, internal API" },
            { key: "description",     label: "What should it do?", placeholder: "Describe the action and its purpose", textarea: true },
            { key: "inputs",          label: "Expected Inputs",   placeholder: "e.g. order_id (string), customer_email (string)" },
            { key: "expected_output", label: "Expected Output",   placeholder: "e.g. { status, items, tracking_url }" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">{f.label}</label>
              {f.textarea ? (
                <textarea
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 resize-none"
                />
              ) : (
                <input
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name || submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-medium hover:from-cyan-400 hover:to-indigo-500 transition disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NativeMcpSnippet() {
  const [copied, setCopied] = useState(false);
  const snippet = `{
  "mcpServers": {
    "operon": {
      "url": "https://your-operon.app/api/v1/mcp",
      "transport": "streamable-http",
      "headers": {
        "Authorization": "Bearer <YOUR_OPERON_API_KEY>"
      }
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Native MCP Config for Claude / Cursor</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-800">
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-cyan-300 overflow-auto leading-relaxed">{snippet}</pre>
    </div>
  );
}

export default function ToolsMcpManager({
  tools = [],
  mcpServers = [],
  toolRequests = [],
  loading = false,
  onToggleTool,
  onConnectMcp,
  onDisconnectMcp,
  onRequestTool,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("tools");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredTools = tools.filter(t => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
      </div>
    );
  }

  const TABS = [
    { id: "tools",   label: "Tool Registry",         icon: Wrench },
    { id: "mcp",     label: "MCP Servers",            icon: Server },
    { id: "config",  label: "Native MCP Endpoint",    icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Tools & MCP</h2>
          <p className="text-sm text-slate-400 mt-1">Manage agent capabilities, external MCP servers, and tool permissions</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/10 transition"
        >
          <Plus className="w-4 h-4" /> Request a Tool
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800/50 pb-1">
        {TABS.map(t => {
          const TIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.id ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <TIcon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tool Registry Tab */}
      {tab === "tools" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools…"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
              />
            </div>
            <div className="flex gap-1">
              {["all", "builtin", "integration", "mcp", "custom"].map(c => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                    categoryFilter === c ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map(tool => (
              <ToolCard key={tool.id || tool.name} tool={tool} onToggle={onToggleTool} />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              No tools match your search.
            </div>
          )}
        </div>
      )}

      {/* MCP Servers Tab */}
      {tab === "mcp" && (
        <div className="space-y-4">
          {mcpServers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                <Server className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No MCP servers connected</h3>
              <p className="text-sm text-slate-400 max-w-sm">Connect external MCP servers to extend your agents with additional tools and data sources.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mcpServers.map(server => (
                <McpServerCard key={server.id || server.name} server={server} onConnect={onConnectMcp} onDisconnect={onDisconnectMcp} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Native MCP Config Tab */}
      {tab === "config" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400 leading-relaxed">
            Connect Claude Desktop, Cursor, or any MCP-compatible client to Operon's native MCP server endpoint.
            This exposes your workspace's tools, knowledge retrieval, and incident management capabilities.
          </p>
          <NativeMcpSnippet />
        </div>
      )}

      {/* Tool Requests Section */}
      {toolRequests.length > 0 && (
        <section className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-3">Your Tool Requests</h3>
          <div className="space-y-2">
            {toolRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-200">{req.name}</p>
                  <p className="text-xs text-slate-500">{req.system} — {req.status}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  req.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  req.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                  "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <RequestToolModal open={showRequestModal} onClose={() => setShowRequestModal(false)} onSubmit={onRequestTool} />
    </div>
  );
}
