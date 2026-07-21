"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

type Snapshot = {
  id: string;
  snapshot_date: string;
  api_input_tokens: number;
  api_cache_read_tokens: number;
  api_cache_creation_tokens: number;
  api_output_tokens: number;
  claude_code_input_tokens: number;
  claude_code_cache_read_tokens: number;
  claude_code_output_tokens: number;
  claude_code_sessions: number;
  total_energy_wh: number;
  total_water_ml: number;
  source: string;
  notes: string | null;
  created_at: string;
};

type Totals = {
  api_input_tokens: number;
  api_cache_read_tokens: number;
  api_output_tokens: number;
  energy_wh: number;
  water_ml: number;
};

function computeEnergy(snapshots: Snapshot[]): number {
  return snapshots.reduce((sum, s) => {
    return (
      sum +
      (s.api_input_tokens * 200 +
        s.api_cache_read_tokens * 20 +
        s.api_cache_creation_tokens * 25 +
        s.api_output_tokens * 990 +
        s.claude_code_input_tokens * 200 +
        s.claude_code_cache_read_tokens * 20 +
        s.claude_code_output_tokens * 990) /
        1_000_000
    );
  }, 0);
}

function computeWater(energy_wh: number): number {
  return (energy_wh / 1000) * 0.15 * 1000;
}

function sumTotals(snapshots: Snapshot[]): Totals {
  const api_input_tokens = snapshots.reduce((s, x) => s + x.api_input_tokens, 0);
  const api_cache_read_tokens = snapshots.reduce((s, x) => s + x.api_cache_read_tokens, 0);
  const api_output_tokens = snapshots.reduce((s, x) => s + x.api_output_tokens, 0);
  const energy_wh = computeEnergy(snapshots);
  const water_ml = computeWater(energy_wh);
  return { api_input_tokens, api_cache_read_tokens, api_output_tokens, energy_wh, water_ml };
}

function fmt(n: number): string {
  return n.toLocaleString();
}

const CLAUDE_AI_SESSIONS = 50;
const CLAUDE_AI_ENERGY_WH = 116;
const CLAUDE_AI_WATER_ML = 17;

export default function ImpactTab() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  async function fetchSnapshots() {
    const supabase = getSupabaseBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch("/api/admin-usage-snapshots", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const json = await res.json();
      setSnapshots(json.snapshots ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSnapshots();
  }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncError(null);

    const supabase = getSupabaseBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch("/api/admin-sync-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok) {
        setSyncError(json.error ?? `Sync failed (${res.status})`);
        return;
      }
      await fetchSnapshots();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const totals = sumTotals(snapshots);
  const lastSynced = snapshots.length > 0 ? snapshots[0].snapshot_date : null;

  const totalEnergyWh = totals.energy_wh + CLAUDE_AI_ENERGY_WH;
  const totalWaterMl = totals.water_ml + CLAUDE_AI_WATER_ML;
  const showerSeconds = Math.round(totalWaterMl / 33);

  return (
    <div>
      {/* Section A: Sync Controls */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-colors ${
              syncing
                ? "bg-[#00205C]/10 text-[#76777A] cursor-not-allowed"
                : "bg-[#4B858E] text-[#080C14] hover:bg-[#5a9aa4] cursor-pointer"
            }`}
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Syncing...
              </span>
            ) : (
              "Sync from Anthropic"
            )}
          </button>
        </div>
        <p className="text-[#76777A] text-xs italic font-normal">
          Last synced:{" "}
          {lastSynced
            ? new Date(lastSynced).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "Never synced"}
        </p>
        {syncError && (
          <p className="text-red-400 text-xs mt-2 font-normal">
            Sync failed: {syncError}
          </p>
        )}
      </div>

      {/* Section B: Cards */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-[#00205C]/10 rounded w-1/2" />
          <div className="h-4 bg-[#00205C]/10 rounded w-3/4" />
          <div className="h-4 bg-[#00205C]/10 rounded w-2/3" />
        </div>
      ) : snapshots.length === 0 ? (
        <p className="text-[#76777A] text-sm font-normal">
          No data yet. Click Sync to pull from Anthropic.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* API Usage card */}
            <div className="bg-white rounded-2xl p-6 border border-[#00205C]/10">
              <p className="text-xs font-bold tracking-widest uppercase text-[#4B858E] mb-4">
                API Usage
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-navy/70 text-sm font-normal">Input tokens</span>
                  <span className="text-[#00205C] text-sm font-medium">{fmt(totals.api_input_tokens)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/70 text-sm font-normal">Cache read tokens</span>
                  <span className="text-[#00205C] text-sm font-medium">{fmt(totals.api_cache_read_tokens)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/70 text-sm font-normal">Output tokens</span>
                  <span className="text-[#00205C] text-sm font-medium">{fmt(totals.api_output_tokens)}</span>
                </div>
                <div className="h-px bg-[#00205C]/10 my-2" />
                <div className="flex justify-between">
                  <span className="text-navy/70 text-sm font-normal">Energy</span>
                  <span className="text-[#00205C] text-sm font-medium">{totals.energy_wh.toFixed(2)} Wh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/70 text-sm font-normal">Water</span>
                  <span className="text-[#00205C] text-sm font-medium">{totals.water_ml.toFixed(1)} ml</span>
                </div>
              </div>
              <p className="text-[#76777A] text-xs font-normal">
                Source: Anthropic Admin API
              </p>
            </div>

            {/* Claude.ai Chats card */}
            <div className="bg-white rounded-2xl p-6 border border-[#00205C]/10">
              <p className="text-xs font-bold tracking-widest uppercase text-[#4B858E] mb-4">
                Claude.ai Chats
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-navy/70 text-sm font-normal">Planning sessions</span>
                  <span className="text-[#00205C] text-sm font-medium">~{CLAUDE_AI_SESSIONS} (estimated)</span>
                </div>
                <div className="h-px bg-[#00205C]/10 my-2" />
                <div className="flex justify-between">
                  <span className="text-navy/70 text-sm font-normal">Energy</span>
                  <span className="text-[#00205C] text-sm font-medium">~{CLAUDE_AI_ENERGY_WH} Wh (estimated)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/70 text-sm font-normal">Water</span>
                  <span className="text-[#00205C] text-sm font-medium">~{CLAUDE_AI_WATER_ML} ml (estimated)</span>
                </div>
              </div>
              <p className="text-[#76777A] text-xs leading-relaxed font-normal">
                Claude.ai subscription usage is not accessible via API. Estimated from session count x 0.31 Wh average query energy (Epoch AI 2025).
              </p>
            </div>
          </div>

          {/* Combined Totals bar */}
          <div className="border border-[#4B858E]/40 rounded-2xl p-6 bg-[#4B858E]/05">
            <p className="text-xs font-bold tracking-widest uppercase text-[#4B858E] mb-3">
              Combined Totals
            </p>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[#4B858E] text-2xl font-bold">
                  {totalEnergyWh.toFixed(1)} Wh total
                </p>
                <p className="text-[#76777A] text-xs mt-0.5 font-normal">
                  measured + estimated
                </p>
              </div>
              <div>
                <p className="text-[#4B858E] text-2xl font-bold">
                  {totalWaterMl.toFixed(1)} ml total
                </p>
                <p className="text-[#76777A] text-xs mt-0.5 font-normal">
                  measured + estimated
                </p>
              </div>
              <div>
                <p className="text-[#4B858E] text-2xl font-bold">
                  ~{showerSeconds}s of a shower
                </p>
                <p className="text-[#76777A] text-xs mt-0.5 font-normal">
                  water equivalent
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
