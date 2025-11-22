'use client';

import { startTransition, useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Calendar,
  Wallet,
  TrendingDown,
  Filter,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useCurrency } from "@/hooks/useCurrency";
import { apiFetch } from "@/lib/api-client";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface HistoryItem {
  id: string;
  type: "budget" | "expense";
  name: string;
  amount: number;
  date: string;
  month: string;
  status?: string;
  category?: string;
}

export function HistoryPage() {
  const { token } = useAuth();
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "budget" | "expense">(
    "all",
  );
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [totals, setTotals] = useState({ budgets: 0, expenses: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    startTransition(() => setLoading(true));
    apiFetch<{ history: HistoryItem[]; totals: typeof totals }>(
      "/api/history",
      {},
      token,
    )
      .then((data) =>
        startTransition(() => {
          setHistoryData(data.history);
          setTotals(data.totals);
        }),
      )
      .finally(() => startTransition(() => setLoading(false)));
  }, [token]);

  const months = useMemo(() => {
    const unique = new Set(historyData.map((item) => item.month));
    return ["all", ...Array.from(unique)];
  }, [historyData]);

  const filteredData = historyData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.amount.toString().includes(searchQuery);
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesMonth = selectedMonth === "all" || item.month === selectedMonth;

    return matchesSearch && matchesType && matchesMonth;
  });

  const groupedByMonth = filteredData.reduce((acc, item) => {
    if (!acc[item.month]) {
      acc[item.month] = [];
    }
    acc[item.month].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  const handleExport = () => {
    const headers = ["Type", "Name", "Amount", "Category", "Status", "Date", "Month"];
    const rows = filteredData.map((item) => [
      item.type,
      item.name,
      item.amount.toString(),
      item.category || "",
      item.status || "",
      item.date,
      item.month,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tresor-budget-export-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterChange = (value: string) => {
    if (value === "all" || value === "budget" || value === "expense") {
      setFilterType(value);
    }
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-[#9fbca0]">View and search your financial history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-[#2c3f2d] bg-[#101910] p-4 break-words">
          <p className="text-sm text-[#9fbca0]">Total Budgets</p>
          <h3 className="text-xl sm:text-2xl font-semibold text-white break-words overflow-wrap-anywhere">{totals.budgets}</h3>
        </Card>
        <Card className="border-[#2c3f2d] bg-[#101910] p-4 break-words">
          <p className="text-sm text-[#9fbca0]">Total Expenses</p>
          <h3 className="text-xl sm:text-2xl font-semibold text-white break-words overflow-wrap-anywhere">{totals.expenses}</h3>
        </Card>
        <Card className="border-[#2c3f2d] bg-[#101910] p-4 break-words">
          <p className="text-sm text-[#9fbca0]">Total Spent</p>
          <p className="text-xl sm:text-2xl font-semibold text-[#fa5238] break-words overflow-wrap-anywhere">
            {formatCurrency(totals.totalAmount)}
          </p>
        </Card>
      </div>

      <Card className="border-[#2c3f2d] bg-[#101910] p-4 mb-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#9fbca0]" />
            <Input
              type="text"
              placeholder="Search by name or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-transparent"
            />
          </div>

          <Tabs value={filterType} onValueChange={handleFilterChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="budget">Budgets</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Filter className="size-5 text-[#9fbca0]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1 rounded-lg border border-[#2c3f2d] bg-[#0f160f] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f7f33]"
            >
              {months.map((month) => (
                <option key={month} value={month} className="bg-[#0f160f]">
                  {month === "all" ? "All Months" : month}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleExport} variant="outline" className="w-full">
            <Download className="mr-2 size-4" /> Export to CSV
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        {Object.keys(groupedByMonth).length === 0 ? (
          <Card className="border-[#2c3f2d] bg-[#101910] p-8 text-center">
            <Search className="mx-auto mb-4 size-10 text-[#9fbca0]" />
            <h4 className="mb-2 text-xl font-semibold">No results</h4>
            <p className="text-[#9fbca0]">Try adjusting your search or filters</p>
          </Card>
        ) : (
          Object.entries(groupedByMonth).map(([month, items]) => (
            <div key={month}>
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="size-5 text-[#2f7f33]" />
                <h3 className="text-xl font-semibold">{month}</h3>
                <Badge variant="secondary">{items.length} items</Badge>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="border-[#1f2a20] bg-[#0f160f] p-4 hover:border-[#2f7f33]/40"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-1 items-center gap-3">
                        <div
                          className={`rounded-xl p-3 ${
                            item.type === "budget"
                              ? "bg-[#2f7f33]/15 text-[#0bda3c]"
                              : "bg-[#fa5238]/15 text-[#fa5238]"
                          }`}
                        >
                          {item.type === "budget" ? (
                            <Wallet className="size-5" />
                          ) : (
                            <TrendingDown className="size-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-white">
                              {item.name}
                            </h4>
                            {item.status && (
                              <Badge
                                variant={
                                  item.status === "active" ? "default" : "secondary"
                                }
                              >
                                {item.status}
                              </Badge>
                            )}
                            {item.category && (
                              <Badge variant="outline">{item.category}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#9fbca0]">
                            {new Date(item.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={
                            item.type === "budget" ? "text-[#0bda3c]" : "text-[#fa5238]"
                          }
                        >
                          {item.type === "expense" && "-"}
                          {formatCurrency(item.amount)}
                        </p>
                        <ChevronRight className="size-5 text-[#9fbca0]" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {loading && (
        <p className="text-center text-sm text-[#9fbca0]">Syncing history...</p>
      )}
    </div>
  );
}
