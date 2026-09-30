import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Database, HelpCircle, Menu, Settings, Shield, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { getSystemStatus, setActiveUserRoleAction } from "@/lib/fraudlens/analyze.functions";
import { useFraudLens } from "@/lib/fraudlens/store";
import { Disclosure } from "./ui";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/analyze", label: "Analyze" },
  { to: "/cases", label: "Cases" },
  { to: "/security", label: "Security" },
  { to: "/evaluation", label: "Evaluation" },
  { to: "/architecture", label: "Architecture" },
  { to: "/docs", label: "Documentation" },
] as const;

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <circle cx="14" cy="14" r="7" fill="none" stroke="white" strokeWidth="2.2" />
      <path
        d="M10.5 15.5l2.2-2.4 1.8 1.6 3-3.4"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M19.2 19.2l5 5" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function Status() {
  const fetchStatus = useServerFn(getSystemStatus);
  const { running } = useFraudLens();
  const q = useQuery({
    queryKey: ["status"],
    queryFn: () => fetchStatus(),
    refetchInterval: 30000,
  });
  const state = q.isError
    ? { dot: "bg-destructive", text: "Engine: Unreachable" }
    : q.isLoading
      ? { dot: "bg-muted-foreground", text: "Engine: Connecting…" }
      : running
        ? { dot: "bg-primary animate-pulse", text: "Engine: Analyzing" }
        : q.data?.aiConfigured
          ? { dot: "bg-success", text: "FraudLens: Ready" }
          : { dot: "bg-warning", text: "Engine: Ready (Deterministic)" };

  return (
    <div className="hidden items-center gap-2 sm:inline-flex">
      <span
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
        role="status"
      >
        <span className={cn("h-2 w-2 rounded-full", state.dot)} aria-hidden />
        {state.text}
      </span>
      {q.data?.databaseReady && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <Database className="h-3 w-3" />
          DB: {q.data.totalRecords ?? 35} records
        </span>
      )}
    </div>
  );
}

function RoleSelector() {
  const fetchStatus = useServerFn(getSystemStatus);
  const setRoleFn = useServerFn(setActiveUserRoleAction);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["status"], queryFn: () => fetchStatus() });
  const currentRole = q.data?.activeUserRole || "admin";

  const mutation = useMutation({
    mutationFn: (role: "admin" | "analyst" | "viewer") => setRoleFn({ data: { role } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["status"] });
      void qc.invalidateQueries({ queryKey: ["cases"] });
      void qc.invalidateQueries({ queryKey: ["transactions"] });
      void qc.invalidateQueries({ queryKey: ["auditLogs"] });
    },
  });

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-xs">
      <Shield className="h-3.5 w-3.5 text-primary" />
      <span className="hidden font-medium text-muted-foreground md:inline">Role:</span>
      <select
        aria-label="Active user role"
        value={currentRole}
        onChange={(e) => mutation.mutate(e.target.value as "admin" | "analyst" | "viewer")}
        className="cursor-pointer bg-transparent font-medium capitalize text-foreground outline-none"
      >
        <option value="admin">Admin (Full Access)</option>
        <option value="analyst">Analyst (Analyze & Triage)</option>
        <option value="viewer">Viewer (Read Only)</option>
      </select>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Disclosure />
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 md:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo />
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold">FraudLens</span>
              <span className="block text-[11px] text-muted-foreground">
                Full-Stack Risk Intelligence
              </span>
            </span>
          </Link>
          <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Status />
            <RoleSelector />
            <Link
              to="/architecture"
              aria-label="Settings and configuration"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <Link
              to="/docs"
              aria-label="Help and documentation"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HelpCircle className="h-4 w-4" />
            </Link>
            <button
              className="rounded-md p-2 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border px-4 py-2 lg:hidden" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                activeProps={{ className: "bg-accent font-medium text-accent-foreground" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">{children}</main>
      <footer className="border-t border-border bg-card py-5 text-center text-xs text-muted-foreground">
        FraudLens — Full-Stack AI Transaction Risk Intelligence & Investigation Platform · Synthetic
        Data Prototype with PostgreSQL/In-Memory Engine
      </footer>
    </div>
  );
}
