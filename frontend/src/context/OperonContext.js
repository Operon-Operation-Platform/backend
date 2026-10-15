"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { operonApi, getOperonToken, setOperonToken } from "../api/operon";

const OperonContext = createContext(null);

export function OperonProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global platform state
  const [agents, setAgents] = useState([]);
  const [runs, setRuns] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [tools, setTools] = useState([]);
  const [mcpServers, setMcpServers] = useState([]);
  const [toolRequests, setToolRequests] = useState([]);
  const [stats, setStats] = useState({});

  // Bootstrap session
  const checkSession = useCallback(async () => {
    const token = getOperonToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await operonApi.auth.getMe();
      setUser(data.user);
      setWorkspaces(data.workspaces || []);
      setActiveWorkspace(data.active_workspace);
    } catch {
      setOperonToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Refresh domain data
  const refreshData = useCallback(async () => {
    if (!getOperonToken()) return;
    try {
      const [agentRes, runsRes, approvalsRes, toolsRes, mcpRes, reqRes] =
        await Promise.allSettled([
          operonApi.agents.getAgents(),
          operonApi.runs.getRuns(),
          operonApi.approvals.getApprovals("pending"),
          operonApi.toolsAndMcp.getTools(),
          operonApi.toolsAndMcp.getMcpServers(),
          operonApi.toolsAndMcp.getToolRequests(),
        ]);

      if (agentRes.status === "fulfilled") setAgents(agentRes.value || []);
      if (runsRes.status === "fulfilled") setRuns(runsRes.value || []);
      if (approvalsRes.status === "fulfilled") setApprovals(approvalsRes.value || []);
      if (toolsRes.status === "fulfilled") setTools(toolsRes.value || []);
      if (mcpRes.status === "fulfilled") setMcpServers(mcpRes.value || []);
      if (reqRes.status === "fulfilled") setToolRequests(reqRes.value || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  const login = async (credentials) => {
    const data = await operonApi.auth.login(credentials);
    setOperonToken(data.access_token);
    setUser(data.user);
    setWorkspaces(data.workspaces || []);
    setActiveWorkspace(data.active_workspace);
    await refreshData();
    return data;
  };

  const signup = async (payload) => {
    const data = await operonApi.auth.signup(payload);
    setOperonToken(data.access_token);
    setUser(data.user);
    setWorkspaces(data.workspaces || []);
    setActiveWorkspace(data.active_workspace);
    await refreshData();
    return data;
  };

  const logout = () => {
    setOperonToken(null);
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
    setAgents([]);
    setRuns([]);
    setApprovals([]);
    router.push("/login");
  };

  const switchWorkspace = async (workspaceId) => {
    try {
      await operonApi.auth.switchWorkspace(workspaceId);
      const me = await operonApi.auth.getMe();
      setActiveWorkspace(me.active_workspace);
      setWorkspaces(me.workspaces || []);
      await refreshData();
    } catch {}
  };

  return (
    <OperonContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        loading,
        agents,
        runs,
        approvals,
        tools,
        mcpServers,
        toolRequests,
        stats,
        login,
        signup,
        logout,
        switchWorkspace,
        refreshData,
      }}
    >
      {children}
    </OperonContext.Provider>
  );
}

export function useOperon() {
  const context = useContext(OperonContext);
  if (!context) {
    throw new Error("useOperon must be used within an OperonProvider");
  }
  return context;
}
