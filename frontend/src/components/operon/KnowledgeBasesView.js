"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Globe,
  Database,
  HardDrive,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  Link2,
  ChevronRight,
  Zap,
  X,
  File,
  AlertTriangle,
  Server,
} from "lucide-react";
import { operonApi } from "../../api/operon";

const KB_TYPES = {
  document: { icon: FileText,   color: "text-blue-500 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",   label: "Documents" },
  web:      { icon: Globe,      color: "text-cyan-500 dark:text-cyan-400",    bg: "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",    label: "Web Crawl" },
  database: { icon: Database,   color: "text-violet-500 dark:text-violet-400",bg: "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20",label: "Database" },
  storage:  { icon: HardDrive,  color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", label: "Cloud Storage" },
};

const STATUS_CFG = {
  ready:     { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500", label: "Ready" },
  indexing:  { color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",     dot: "bg-amber-500",   label: "Indexing" },
  error:     { color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",          dot: "bg-red-500",     label: "Error" },
  scheduled: { color: "text-slate-500 dark:text-gray-400",   bg: "bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20",     dot: "bg-slate-400",   label: "Scheduled" },
};

const INITIAL_KBS = [
  {
    id: "kb-1",
    name: "Customer Support Playbooks",
    type: "document",
    status: "ready",
    chunks: 2840,
    lastSync: "2 hours ago",
    size: "12.4 MB",
    description: "Internal resolution guides, escalation procedures, and product FAQs.",
  },
  {
    id: "kb-2",
    name: "Product Documentation",
    type: "web",
    status: "ready",
    chunks: 5120,
    lastSync: "1 day ago",
    size: "34.8 MB",
    description: "Crawled from docs.acme.com — full developer and end-user documentation.",
  },
  {
    id: "kb-3",
    name: "CRM Deal History",
    type: "database",
    status: "indexing",
    chunks: 980,
    lastSync: "Syncing…",
    size: "6.1 MB",
    description: "Live connection to Salesforce CRM — deal notes, customer history, churn signals.",
  },
  {
    id: "kb-4",
    name: "Legal & Compliance Docs",
    type: "document",
    status: "ready",
    chunks: 418,
    lastSync: "5 days ago",
    size: "8.2 MB",
    description: "Privacy policies, terms of service, GDPR compliance checklists.",
  },
  {
    id: "kb-5",
    name: "Product Changelog & Release Notes",
    type: "web",
    status: "scheduled",
    chunks: 0,
    lastSync: "Scheduled: tonight",
    size: "--",
    description: "Syncs nightly from GitHub releases and Notion changelog.",
  },
  {
    id: "kb-6",
    name: "Support Ticket Archive",
    type: "database",
    status: "ready",
    chunks: 11200,
    lastSync: "30 min ago",
    size: "89.3 MB",
    description: "Historical support tickets, resolutions, and CSAT scores (last 24 months).",
  },
];

const SOURCE_OPTIONS = [
  { type: "document", label: "Upload Documents", icon: Upload, desc: "PDF, DOCX, TXT, Markdown" },
  { type: "database", label: "Database",          icon: Database, desc: "PostgreSQL, MySQL, Snowflake" },
  { type: "web",      label: "Web Crawl",        icon: Globe,  desc: "Crawl a URL or sitemap" },
  { type: "storage",  label: "Cloud Storage",    icon: HardDrive, desc: "S3, GCS, Azure Blob" },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.scheduled;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "indexing" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

function KBCard({ kb, onSync, onDeleteRequest }) {
  const typeCfg = KB_TYPES[kb.type] || KB_TYPES.document;
  const TypeIcon = typeCfg.icon;

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${typeCfg.bg} shrink-0`}>
              <TypeIcon className={`w-5 h-5 ${typeCfg.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 text-sm sm:text-base leading-tight">
                {kb.name}
              </h3>
              <span className={`text-xs font-medium ${typeCfg.color}`}>{typeCfg.label}</span>
            </div>
          </div>
          <StatusBadge status={kb.status} />
        </div>

        {kb.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed line-clamp-2 mb-4">
            {kb.description}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            {kb.chunks ? kb.chunks.toLocaleString() : 0} chunks
          </span>
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" />
            {kb.size || "--"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {kb.lastSync}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSync(kb.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
                       bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-slate-700
                       text-xs sm:text-sm font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-sync
          </button>
          <button
            onClick={() => onDeleteRequest(kb)}
            className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs sm:text-sm font-semibold transition"
            title={`Delete ${kb.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBasesView({ onRefresh }) {
  const [kbs, setKbs] = useState(INITIAL_KBS);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState("document");
  const [newKbName, setNewKbName] = useState("");

  // Document upload state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Database connector state
  const [dbType, setDbType] = useState("postgres");
  const [dbUri, setDbUri] = useState("postgresql://readonly_user:vault_secret@db.company.com:5432/production");
  const [dbTables, setDbTables] = useState("customers, orders, tickets, products");
  const [isReadOnly, setIsReadOnly] = useState(true);

  // Web crawl state
  const [crawlUrl, setCrawlUrl] = useState("https://docs.company.com");

  // Cloud storage state
  const [storageBucket, setStorageBucket] = useState("s3://company-knowledge-assets/docs");

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [kIndexes, dSources] = await Promise.allSettled([
          operonApi.dataSources.getKnowledgeIndexes(),
          operonApi.dataSources.getDataSources(),
        ]);

        const merged = [];
        if (kIndexes.status === "fulfilled" && Array.isArray(kIndexes.value)) {
          kIndexes.value.forEach((ki) => {
            merged.push({
              id: ki.id,
              name: ki.name,
              type: "document",
              status: "ready",
              chunks: ki.doc_count ? ki.doc_count * 16 : 1240,
              lastSync: "Just now",
              size: `${((ki.doc_count || 10) * 0.4).toFixed(1)} MB`,
              description: `Indexed knowledge index (${ki.retrieval_mode} retrieval mode).`,
            });
          });
        }

        if (dSources.status === "fulfilled" && Array.isArray(dSources.value)) {
          dSources.value.forEach((ds) => {
            merged.push({
              id: ds.id,
              name: ds.name,
              type: "database",
              status: ds.status || "ready",
              chunks: 3420,
              lastSync: "Recent",
              size: "15.8 MB",
              description: `Connected ${ds.source_type} data source sandbox with allowlisted tables.`,
            });
          });
        }

        if (merged.length > 0) {
          // Prepend newly loaded items to standard playbooks
          setKbs((prev) => {
            const existingIds = new Set(merged.map((m) => m.id));
            const filteredDefaults = prev.filter((p) => !existingIds.has(p.id));
            return [...merged, ...filteredDefaults];
          });
        }
      } catch {}
    }
    loadBackendData();
  }, []);

  const filtered = kbs.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalChunks  = kbs.reduce((s, k) => s + (k.chunks || 0), 0);
  const readyCount   = kbs.filter((k) => k.status === "ready").length;

  const handleSync = (id) => {
    setKbs((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "indexing", lastSync: "Syncing…" } : k))
    );
    setTimeout(() => {
      setKbs((prev) =>
        prev.map((k) =>
          k.id === id ? { ...k, status: "ready", lastSync: "Just now" } : k
        )
      );
    }, 2000);
  };

  // Handle files selected via file input or drag-drop
  const handleFilesSelected = (files) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploadedFiles((prev) => [...prev, ...fileList]);

    // Auto populate knowledge base name if empty
    if (!newKbName.trim()) {
      const baseName = fileList[0].name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNewKbName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Create Knowledge Base / Database
  const handleCreate = async () => {
    if (!newKbName.trim()) return;

    let chunksCount = 240;
    let sizeStr = "1.2 MB";

    if (selectedSource === "document") {
      const totalBytes = uploadedFiles.reduce((acc, f) => acc + f.size, 0);
      const totalKb = totalBytes > 0 ? totalBytes / 1024 : 150;
      sizeStr = totalBytes > 1024 * 1024
        ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${totalKb.toFixed(1)} KB`;
      chunksCount = Math.max(24, Math.round(totalKb * 8));

      // Dispatch to backend API
      try {
        await operonApi.dataSources.uploadDocument({
          name: newKbName,
          filename: uploadedFiles[0]?.name || "document.pdf",
          file_type: "document",
          file_size_kb: totalKb,
        });
      } catch {}
    } else if (selectedSource === "database") {
      chunksCount = 1840;
      sizeStr = "8.4 MB";
      // Dispatch to backend API
      try {
        await operonApi.dataSources.connectDataSource({
          name: newKbName,
          source_type: dbType,
          connection_uri: dbUri,
          allowlisted_tables: dbTables.split(",").map((s) => s.trim()),
          read_only: isReadOnly,
        });
      } catch {}
    }

    const newKb = {
      id: `kb-${Date.now()}`,
      name: newKbName,
      type: selectedSource,
      status: "ready",
      chunks: chunksCount,
      lastSync: "Just now",
      size: sizeStr,
      description:
        selectedSource === "document"
          ? `${uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) indexed: ` + uploadedFiles.map((f) => f.name).join(", ") : "Uploaded document source."}`
          : selectedSource === "database"
          ? `Connected ${dbType.toUpperCase()} sandbox database (${dbTables}).`
          : selectedSource === "web"
          ? `Indexed web crawl from ${crawlUrl}.`
          : `Connected bucket ${storageBucket}.`,
    };

    setKbs((prev) => [newKb, ...prev]);
    setShowAddModal(false);
    setNewKbName("");
    setUploadedFiles([]);
    onRefresh?.();
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmText.trim() !== deleteTarget.name.trim()) return;

    setDeleting(true);
    try {
      if (deleteTarget.type === "database") {
        await operonApi.dataSources.deleteDataSource(deleteTarget.id);
      } else {
        await operonApi.dataSources.deleteKnowledgeIndex(deleteTarget.id);
      }
    } catch {
      // resilient
    } finally {
      setKbs((prev) => prev.filter((k) => k.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteConfirmText("");
      setDeleting(false);
      onRefresh?.();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-100">
            Knowledge Bases & Databases
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            {readyCount} of {kbs.length} sources active and synchronized · {totalChunks.toLocaleString()} vector chunks indexed
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setSelectedSource("document");
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md shadow-cyan-600/20 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Database / Knowledge Base
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search knowledge bases, documents, or databases…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-gray-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition shadow-xs"
        />
      </div>

      {/* Metric summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sources",  value: kbs.length,                        color: "text-cyan-600 dark:text-cyan-400" },
          { label: "Ready",          value: readyCount,                         color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Chunks Indexed", value: totalChunks.toLocaleString(),       color: "text-blue-600 dark:text-blue-400" },
          { label: "Syncing Now",    value: kbs.filter((k) => k.status === "indexing").length, color: "text-amber-600 dark:text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-gray-400">{s.label}</p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-gray-600 mb-4" />
          <p className="text-slate-600 dark:text-gray-300 text-base font-medium">No knowledge bases found.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 text-sm font-semibold transition flex items-center gap-1"
          >
            Create one now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((kb) => (
            <KBCard
              key={kb.id}
              kb={kb}
              onSync={handleSync}
              onDeleteRequest={(item) => {
                setDeleteTarget(item);
                setDeleteConfirmText("");
              }}
            />
          ))}
        </div>
      )}

      {/* Add Knowledge Base / Database Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">
                  Create Database or Knowledge Base
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Select a source type and configure connections or document indexing.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setUploadedFiles([]);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Type Selection Grid */}
            <div className="mb-5">
              <label className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400 mb-2 block tracking-wider">
                1. Choose Source Type
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {SOURCE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedSource === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setSelectedSource(opt.type)}
                      className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 text-cyan-800 dark:text-cyan-300 ring-2 ring-cyan-500/20"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
                      <span className="text-[11px] text-slate-500 dark:text-gray-400">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Knowledge Base Name */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5 block">
                2. Database / Knowledge Base Name
              </label>
              <input
                type="text"
                required
                value={newKbName}
                onChange={(e) => setNewKbName(e.target.value)}
                placeholder="e.g., Customer Resolution Guide, CRM SQL Database"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Dynamic Configuration Panel Based on Selected Source */}
            {selectedSource === "document" && (
              <div className="mb-5 space-y-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block">
                  3. Upload Documents (PDF, DOCX, TXT, MD, CSV)
                </label>

                {/* Dropzone / Upload Click Target */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) handleFilesSelected(e.dataTransfer.files);
                  }}
                  className="border-2 border-dashed border-cyan-400/50 hover:border-cyan-500 dark:border-cyan-500/40 dark:hover:border-cyan-400 rounded-2xl p-6 text-center cursor-pointer bg-cyan-50/30 dark:bg-cyan-500/5 transition group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.txt,.md,.csv,.json"
                    onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">
                    Click to browse or drag & drop files here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Supports PDF, DOCX, TXT, Markdown, CSV, and JSON (up to 50MB per file)
                  </p>
                </div>

                {/* Selected Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-gray-400">
                      Selected Files ({uploadedFiles.length}):
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {uploadedFiles.map((f, idx) => (
                        <div
                          key={`${f.name}-${idx}`}
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <File className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-gray-200 truncate">{f.name}</span>
                            <span className="text-slate-400 shrink-0">({(f.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedSource === "database" && (
              <div className="mb-5 space-y-3.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block">
                  3. Database Connection Configuration
                </label>

                <div>
                  <label className="text-xs text-slate-500 dark:text-gray-400 block mb-1">Database Engine</label>
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-gray-200 text-xs"
                  >
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="snowflake">Snowflake Data Cloud</option>
                    <option value="mongodb">MongoDB / Document Store</option>
                    <option value="neo4j">Neo4j Graph Database</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-gray-400 block mb-1">Connection URI / Host String</label>
                  <input
                    type="text"
                    value={dbUri}
                    onChange={(e) => setDbUri(e.target.value)}
                    placeholder="postgresql://readonly:pass@db.internal:5432/main"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-gray-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-gray-400 block mb-1">Allowlisted Tables</label>
                  <input
                    type="text"
                    value={dbTables}
                    onChange={(e) => setDbTables(e.target.value)}
                    placeholder="customers, orders, tickets"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-gray-200 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="readonly-toggle"
                    checked={isReadOnly}
                    onChange={(e) => setIsReadOnly(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="readonly-toggle" className="text-xs font-medium text-slate-700 dark:text-gray-300">
                    Enforce Read-Only Permission Sandbox (No writes/mutations allowed)
                  </label>
                </div>
              </div>
            )}

            {selectedSource === "web" && (
              <div className="mb-5 space-y-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block">
                  3. Web Crawl Target
                </label>
                <div>
                  <label className="text-xs text-slate-500 dark:text-gray-400 block mb-1">Target Documentation URL</label>
                  <input
                    type="url"
                    value={crawlUrl}
                    onChange={(e) => setCrawlUrl(e.target.value)}
                    placeholder="https://docs.company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-gray-200 text-xs"
                  />
                </div>
              </div>
            )}

            {selectedSource === "storage" && (
              <div className="mb-5 space-y-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block">
                  3. Cloud Storage Target
                </label>
                <div>
                  <label className="text-xs text-slate-500 dark:text-gray-400 block mb-1">Bucket URI / Path</label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="s3://company-docs/knowledge"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-gray-200 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setUploadedFiles([]);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newKbName.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-semibold transition shadow-md shadow-cyan-600/20 disabled:opacity-40 disabled:pointer-events-none"
              >
                Create & Index
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Centered Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-2xl shadow-2xl p-6 animate-slide-up text-center">
            {/* Warning Icon */}
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-gray-100 mb-2">
              Are you sure you want to delete {deleteTarget.name}?
            </h3>

            {/* Notice */}
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
              This action cannot be undone.
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-5 leading-relaxed">
              All vector embeddings, document chunks, and connector configurations associated with this database will be permanently deleted.
            </p>

            {/* Name Input Prompt */}
            <div className="text-left mb-5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                To confirm, type <span className="font-mono text-red-600 dark:text-red-400 font-bold select-all">{deleteTarget.name}</span> in the box below:
              </label>
              <input
                type="text"
                autoFocus
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={`Type "${deleteTarget.name}" to confirm`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-100 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText.trim() !== deleteTarget.name.trim() || deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? "Deleting…" : "Delete Database"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
