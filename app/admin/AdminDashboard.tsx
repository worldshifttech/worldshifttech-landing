"use client";

import { useState } from "react";

type ActiveTab = "projects" | "clients";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("projects");

  return (
    <div className="min-h-screen px-6 py-10 max-w-6xl mx-auto w-full">
      <h1
        className="text-3xl font-bold text-[#F4F2EE] mb-8"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Admin
      </h1>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-8 border-b border-white/[0.08] pb-0">
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150 border-b-2 -mb-px ${
            activeTab === "projects"
              ? "text-[#4B858E] border-[#4B858E]"
              : "text-[#767B7A] border-transparent hover:text-[#F4F2EE]"
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150 border-b-2 -mb-px ${
            activeTab === "clients"
              ? "text-[#4B858E] border-[#4B858E]"
              : "text-[#767B7A] border-transparent hover:text-[#F4F2EE]"
          }`}
        >
          Clients
        </button>
      </div>

      {/* Projects tab */}
      {activeTab === "projects" && (
        <div>
          <p className="text-[#767B7A] text-sm">Project queue coming soon.</p>
        </div>
      )}

      {/* Clients tab */}
      {activeTab === "clients" && (
        <div>
          <h2
            className="text-2xl font-bold text-[#F4F2EE] mb-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Client Profiles
          </h2>
          <p className="text-[#767B7A] text-sm mb-6">
            Client profile management coming in the next session.
          </p>
          <button className="px-5 py-2.5 text-sm font-medium text-[#4B858E] border border-[#4B858E] rounded-full hover:bg-[#4B858E]/10 transition-colors duration-150">
            Add Client
          </button>
        </div>
      )}
    </div>
  );
}
