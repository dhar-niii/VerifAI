import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plane, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateTrip() {
  const navigate = useNavigate();
  const createTrip = useMutation(api.trips.create);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Trip name is required";
    if (!form.startDate) errs.startDate = "Start date is required";
    if (!form.endDate) errs.endDate = "End date is required";
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errs.endDate = "End date must be after start date";
    }
    if (!form.budget || Number(form.budget) <= 0) errs.budget = "Budget must be a positive number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const id = await createTrip({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget),
        visibility: "private",
      });
      toast.success("Trip created! Start adding cities to your itinerary.");
      navigate(`/trips/${id}`);
    } catch (err) {
      toast.error("Failed to create trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Plane className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Trip</h1>
              <p className="text-sm text-muted-foreground">Plan your next adventure</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Fill in the basics for your trip</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Trip Name *</Label>
                  <Input
                    id="name"
                    placeholder='e.g. "Europe Summer Adventure"'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What makes this trip special?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className={errors.startDate ? "border-destructive" : ""}
                    />
                    {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={form.endDate}
                      min={form.startDate || undefined}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className={errors.endDate ? "border-destructive" : ""}
                    />
                    {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget ($) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="1"
                    placeholder="e.g. 5000"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className={errors.budget ? "border-destructive" : ""}
                  />
                  {errors.budget && <p className="text-xs text-destructive">{errors.budget}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                    ) : (
                      <><Plane className="mr-2 h-4 w-4" /> Create Trip</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
