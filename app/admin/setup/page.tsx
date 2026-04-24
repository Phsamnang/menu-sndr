"use client";

import { useState } from "react";
import CategoriesTab from "./components/CategoriesTab";
import MenuItemsTab from "./components/MenuItemsTab";
import TablesTab from "./components/TablesTab";
import TableTypesTab from "./components/TableTypesTab";

type TabKey = "categories" | "menu-items" | "tables" | "table-types";

const TABS: { key: TabKey; label: string }[] = [
  { key: "categories", label: "ប្រភេទម្ហូប" },
  { key: "menu-items", label: "មុខម្ហូប" },
  { key: "tables", label: "តុ" },
  { key: "table-types", label: "ប្រភេទតុ" },
];

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("categories");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">ការកំណត់</h1>

        <div className="mb-6 flex gap-1 border-b border-[#E9ECEF]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "menu-items" && <MenuItemsTab />}
        {activeTab === "tables" && <TablesTab />}
        {activeTab === "table-types" && <TableTypesTab />}
      </div>
    </div>
  );
}
