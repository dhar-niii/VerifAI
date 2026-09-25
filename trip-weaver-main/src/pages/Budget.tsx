import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Wallet, PlusCircle, TrendingUp, AlertTriangle, DollarSign, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const COLORS = ["#E07A3A", "#1E3A5F", "#3D8B6E", "#D4A843", "#7B68EE", "#E06666"];

export default function Budget() {
  const trips = useQuery(api.trips.list);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const expenses = useQuery(
    api.expenses.listByTrip,
    selectedTripId ? { tripId: selectedTripId as any } : "skip"
  );
  const summary = useQuery(
    api.expenses.summary,
    selectedTripId ? { tripId: selectedTripId as any } : "skip"
  );
  const trip = (trips || []).find((t: any) => t._id === selectedTripId);
  const addExpense = useMutation(api.expenses.add);
  const removeExpense = useMutation(api.expenses.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: "Food", amount: "", description: "", date: "" });

  const categories = ["Transportation", "Accommodation", "Activities", "Food", "Shopping", "Other"];

  const handleAdd = async () => {
    if (!selectedTripId || !form.amount || !form.description || !form.date) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await addExpense({
        tripId: selectedTripId as any,
        category: form.category,
        amount: Number(form.amount),
        description: form.description,
        date: form.date,
      });
      setShowAdd(false);
      setForm({ category: "Food", amount: "", description: "", date: "" });
      toast.success("Expense added!");
    } catch {
      toast.error("Failed to add expense");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeExpense({ id: id as any });
      toast.success("Expense removed");
    } catch {
      toast.error("Failed to remove expense");
    }
  };

  const pieData = summary
    ? Object.entries(summary.categories).map(([name, value]) => ({ name, value }))
    : [];

  const barData = summary
    ? Object.entries(summary.byCity).map(([name, value]) => ({ name, spending: value }))
    : [];

  const totalEstimated = expenses
    ? expenses.reduce((s: number, e: any) => s + e.amount, 0)
    : 0;
  const budget = trip?.budget || 0;
  const remaining = budget - totalEstimated;
  const isOverBudget = totalEstimated > budget;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Budget Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">Track expenses across your trips</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedTripId} onValueChange={setSelectedTripId}>
              <SelectTrigger className="w-64">
                <Wallet className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select a trip" />
              </SelectTrigger>
              <SelectContent>
                {(trips || []).map((t: any) => (
                  <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTripId && (
              <Button className="bg-accent hover:bg-accent/90 text-white" onClick={() => setShowAdd(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            )}
          </div>
        </div>

        {!selectedTripId ? (
          <Card>
            <CardContent className="flex flex-col items-center py-20">
              <Wallet className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-semibold">Select a trip to view budget</p>
              <p className="text-sm text-muted-foreground mt-1">Choose a trip from the dropdown above</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Budget", value: `$${budget.toLocaleString()}`, icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Total Spent", value: `$${totalEstimated.toLocaleString()}`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
                { label: "Remaining", value: `$${Math.abs(remaining).toLocaleString()}`, icon: DollarSign, color: remaining >= 0 ? "text-emerald-500" : "text-destructive", bg: remaining >= 0 ? "bg-emerald-500/10" : "bg-destructive/10" },
                { label: "Transactions", value: summary?.count ?? 0, icon: PlusCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {isOverBudget && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive font-medium">
                  You've exceeded your budget by ${Math.abs(remaining).toLocaleString()}!
                </p>
              </div>
            )}

            {/* Budget Progress */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Budget Progress</span>
                  <span className="font-medium">{Math.min(Math.round((totalEstimated / budget) * 100), 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${isOverBudget ? "bg-destructive" : "bg-accent"}`}
                    style={{ width: `${Math.min((totalEstimated / budget) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {pieData.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">By Category</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              {barData.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">By City</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                        <Bar dataKey="spending" fill="#E07A3A" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Expenses List */}
            <Card>
              <CardHeader><CardTitle className="text-base">Recent Expenses</CardTitle></CardHeader>
              <CardContent>
                {expenses && expenses.length > 0 ? (
                  <div className="space-y-2">
                    {expenses.map((exp: any) => (
                      <div key={exp._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <DollarSign className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{exp.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {exp.category} · {format(parseISO(exp.date), "MMM d, yyyy")}
                            {exp.city && ` · ${exp.city.name}`}
                          </p>
                        </div>
                        <span className="font-semibold text-foreground">${exp.amount.toLocaleString()}</span>
                        <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleRemove(exp._id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input type="number" min="0" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Lunch at café" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="bg-accent hover:bg-accent/90 text-white" onClick={handleAdd}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
