"use client";

import React, { useState } from "react";
import {
  Bot, Plus, Play, CheckCircle2, Activity, TrendingUp,
  ShieldAlert, Sparkles, ChevronRight, ArrowUpRight,
  Cpu,
} from "lucide-react";

const STATUS_CONFIG = {
  running:   { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500", label: "Running" },
  succeeded: { color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",       dot: "bg-blue-500",    label: "Succeeded" },
  failed:    { color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",          dot: "bg-red-500",     label: "Failed" },
  paused:    { color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",      dot: "bg-amber-500",   label: "Paused" },
  pending:   { color: "text-slate-500 dark:text-gray-400",   bg: "bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20",      dot: "bg-slate-400",   label: "Pending" },
};

const TEMPLATE_META = {
  customer_support: { color: "from-cyan-500 to-blue-600",    icon: "🎧", label: "Customer Support" },
  sales:            { color: "from-violet-500 to-purple-600", icon: "📈", label: "Sales" },
  operations:       { color: "from-amber-500 to-orange-600",  icon: "⚙️",  label: "Operations" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function MetricCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onOpenWizard }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500/10 via-indigo-600/10 to-violet-600/10 flex items-center justify-center border border-slate-200 dark:border-slate-800">
          <Bot className="w-12 h-12 text-slate-400 dark:text-gray-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-2">No agents created yet</h2>
      <p className="text-slate-500 dark:text-gray-400 max-w-sm mb-6 text-sm leading-relaxed">
        Create your first autonomous AI agent to automate customer inquiries, support workflows, or backend operations.
      </p>
      <button
        onClick={onOpenWizard}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-600/20 transition transform active:scale-95 text-sm"
      >
        <Plus className="w-5 h-5" />
        Create your first agent
      </button>
    </div>
  );
}

function AgentCard({ agent, onRunClick, onSelectAgent }) {
  const meta = TEMPLATE_META[agent.template_key] || TEMPLATE_META.customer_support;
  const isActive = agent.status === "active";
  return (
    <div
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group shadow-xs flex flex-col justify-between"
      onClick={() => onSelectAgent && onSelectAgent(agent)}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl shadow-md`}>
              {meta.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 text-sm sm:text-base leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{meta.label}</p>
            </div>
          </div>
          <StatusBadge status={isActive ? "running" : "paused"} />
        </div>
        {agent.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed line-clamp-2 mb-4">
            {agent.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400 font-medium">
          <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" />{agent.run_count ?? 0} runs</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{agent.success_rate ?? "--"}%</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRunClick && onRunClick(agent); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-semibold transition"
        >
          <Play className="w-3 h-3" /> Run
        </button>
      </div>
    </div>
  );
}

export default function OperonDashboard({
  agents = [],
  recentRuns = [],
  pendingApprovals = [],
  loading = false,
  onOpenWizard,
  onOpenRun,
  onSelectAgent,
  onTriggerRun,
  onApprovalClick,
}) {
  const activeAgents  = agents.filter(a => a.status === "active").length;
  const totalRuns     = recentRuns.length;
  const succeededRuns = recentRuns.filter(r => r.status === "succeeded").length;
  const successRate   = totalRuns ? Math.round((succeededRuns / totalRuns) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <p className="text-slate-500 dark:text-gray-400 text-sm">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-gray-200">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Agents"     value={activeAgents}              sub={`of ${agents.length} total`} icon={Cpu}         color="text-cyan-600 dark:text-cyan-400" />
        <MetricCard label="Total Runs"        value={totalRuns}                 sub="last 7 days"                 icon={Activity}    color="text-emerald-600 dark:text-emerald-400" />
        <MetricCard label="Success Rate"      value={`${successRate}%`}         sub="executions succeeded"        icon={TrendingUp}  color="text-blue-600 dark:text-blue-400" />
        <MetricCard label="Pending Approvals" value={pendingApprovals.length}   sub="awaiting decision"           icon={ShieldAlert} color="text-amber-600 dark:text-amber-400" />
      </div>

      {/* Approvals Banner */}
      {pendingApprovals.length > 0 && (
        <div
          className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-500/15 transition shadow-xs"
          onClick={onApprovalClick}
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                {pendingApprovals.length} action{pendingApprovals.length > 1 ? "s" : ""} awaiting approval
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400/80">Agents are paused waiting for human review</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
      )}

      {/* Agents Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">Your Agents</h2>
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> New Agent
          </button>
        </div>
        {agents.length === 0 ? (
          <EmptyState onOpenWizard={onOpenWizard} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} onRunClick={onTriggerRun} onSelectAgent={onSelectAgent} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Runs Table */}
      {recentRuns.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">Recent Runs</h2>
            <span className="text-xs text-slate-500 dark:text-gray-400">Last 20 executions</span>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Started</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRuns.slice(0, 10).map(run => (
                  <tr key={run.run_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-gray-100 text-sm">{run.agent_name || run.agent_id}</div>
                      <div className="text-xs text-slate-500 dark:text-gray-400 font-mono truncate max-w-[140px]">{run.run_id}</div>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={run.status} /></td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-gray-300 text-xs">{run.duration_ms ? `${(run.duration_ms / 1000).toFixed(2)}s` : "--"}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-gray-400 text-xs hidden md:table-cell">{run.started_at ? new Date(run.started_at).toLocaleString() : "--"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => onOpenRun && onOpenRun(run)} className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition ml-auto">
                        Inspect <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
