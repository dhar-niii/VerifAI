import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  X,
  Eye,
  Globe,
  Clock,
  StickyNote,
} from "lucide-react";

export default function ItineraryBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trip = useQuery(api.trips.get, id ? { id: id as any } : "skip");
  const stops = useQuery(api.stops.listByTrip, id ? { tripId: id as any } : "skip");
  const cities = useQuery(api.cities.list);
  const addStop = useMutation(api.stops.add);
  const removeStop = useMutation(api.stops.remove);
  const addActivityToStop = useMutation(api.tripActivities.add);
  const removeActivity = useMutation(api.tripActivities.remove);
  const updateTrip = useMutation(api.trips.update);

  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null);
  const [addStopForm, setAddStopForm] = useState({ cityId: "", arrivalDate: "", departureDate: "", transportation: "", accommodation: "" });
  const [addActivityForm, setAddActivityForm] = useState({ activityId: "", date: "", startTime: "09:00", notes: "", estimatedCost: "" });

  const tripStops = (stops || []).sort((a: any, b: any) => a.orderIndex - b.orderIndex);

  // Get the city for the currently selected activity stop
  const activeStop = tripStops.find((s: any) => s._id === showAddActivity);
  const activitiesForCity = useQuery(
    api.activities.list,
    activeStop ? { cityId: activeStop.cityId } : "skip"
  );

  if (!trip || !id) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Trip not found</p>
          <Button variant="ghost" onClick={() => navigate("/trips")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trips
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleAddStop = async () => {
    if (!addStopForm.cityId || !addStopForm.arrivalDate || !addStopForm.departureDate) {
      toast.error("Please fill in city, arrival and departure dates");
      return;
    }
    try {
      await addStop({
        tripId: id as any,
        cityId: addStopForm.cityId as any,
        arrivalDate: addStopForm.arrivalDate,
        departureDate: addStopForm.departureDate,
        orderIndex: tripStops.length,
        transportation: addStopForm.transportation || undefined,
        accommodation: addStopForm.accommodation || undefined,
      });
      setShowAddStop(false);
      setAddStopForm({ cityId: "", arrivalDate: "", departureDate: "", transportation: "", accommodation: "" });
      toast.success("City added to your itinerary!");
    } catch {
      toast.error("Failed to add stop");
    }
  };

  const handleAddActivity = async () => {
    if (!showAddActivity || !addActivityForm.activityId || !addActivityForm.date) {
      toast.error("Please select an activity and date");
      return;
    }
    try {
      await addActivityToStop({
        tripStopId: showAddActivity as any,
        activityId: addActivityForm.activityId as any,
        date: addActivityForm.date,
        startTime: addActivityForm.startTime,
        notes: addActivityForm.notes || undefined,
        estimatedCost: Number(addActivityForm.estimatedCost) || 0,
      });
      setShowAddActivity(null);
      setAddActivityForm({ activityId: "", date: "", startTime: "09:00", notes: "", estimatedCost: "" });
      toast.success("Activity added!");
    } catch {
      toast.error("Failed to add activity");
    }
  };

  const handleRemoveStop = async (stopId: string) => {
    try {
      await removeStop({ id: stopId as any });
      toast.success("Stop removed");
    } catch {
      toast.error("Failed to remove stop");
    }
  };

  const handleRemoveActivity = async (actId: string) => {
    try {
      await removeActivity({ id: actId as any });
      toast.success("Activity removed");
    } catch {
      toast.error("Failed to remove activity");
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await updateTrip({
        id: id as any,
        visibility: trip.visibility === "public" ? "private" : "public",
      });
      toast.success(trip.visibility === "public" ? "Trip is now private" : "Trip is now public!");
    } catch {
      toast.error("Failed to update");
    }
  };

  const totalEstimated = tripStops.reduce(
    (sum: number, stop: any) => sum + stop.activities.reduce((s: number, a: any) => s + a.estimatedCost, 0),
    0
  );

  const cityMap: Record<string, any> = {};
  (cities || []).forEach((c: any) => { cityMap[c._id] = c; });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> My Trips
        </Button>

        {/* Trip Header */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/70 p-6 lg:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-accent text-white">{trip.visibility}</Badge>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold">{trip.name}</h1>
                {trip.description && <p className="text-white/70 mt-1">{trip.description}</p>}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/70">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(parseISO(trip.startDate), "MMM d")} – {format(parseISO(trip.endDate), "MMM d, yyyy")}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {tripStops.length} stops</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> ${totalEstimated.toLocaleString()} / ${trip.budget.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-white" onClick={handleToggleVisibility}>
                  <Globe className="mr-1 h-3 w-3" /> {trip.visibility === "public" ? "Make Private" : "Share Public"}
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => navigate(`/public/${id}`)}>
                  <Eye className="mr-1 h-3 w-3" /> Preview
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Budget Used</span>
                <span>${totalEstimated.toLocaleString()} / ${trip.budget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${totalEstimated > trip.budget ? "bg-destructive" : "bg-accent"}`}
                  style={{ width: `${Math.min((totalEstimated / trip.budget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Stops */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Itinerary Stops</h2>
          <Button size="sm" className="bg-accent hover:bg-accent/90 text-white" onClick={() => setShowAddStop(true)}>
            <PlusCircle className="mr-1 h-4 w-4" /> Add Stop
          </Button>
        </div>

        {tripStops.length > 0 ? (
          <div className="space-y-4">
            {tripStops.map((stop: any, idx: number) => {
              const city = cityMap[stop.cityId] || stop.city;
              return (
                <Card key={stop._id} className="overflow-hidden">
                  <div className="flex items-center gap-3 bg-secondary/50 px-4 py-3 border-b">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{city?.name || "Unknown City"}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(stop.arrivalDate), "MMM d")} – {format(parseISO(stop.departureDate), "MMM d, yyyy")}
                        {stop.transportation && ` · 🚌 ${stop.transportation}`}
                        {stop.accommodation && ` · 🏨 ${stop.accommodation}`}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleRemoveStop(stop._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    {stop.activities.length > 0 ? (
                      <div className="space-y-2">
                        {stop.activities.map((ta: any) => (
                          <div key={ta._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                              <Compass className="h-4 w-4 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{ta.activity?.name || "Activity"}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <span>{ta.date}</span>
                                {ta.startTime && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{ta.startTime}</span>}
                                <Badge variant="secondary" className="text-[10px]">{ta.activity?.category}</Badge>
                                {ta.notes && <span className="flex items-center gap-0.5"><StickyNote className="h-3 w-3" />{ta.notes}</span>}
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-accent shrink-0">${ta.estimatedCost}</span>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 w-7 p-0" onClick={() => handleRemoveActivity(ta._id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No activities yet</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full border-dashed border-accent/30 text-accent hover:bg-accent/5"
                      onClick={() => setShowAddActivity(stop._id)}
                    >
                      <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Activity
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <MapPin className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="font-semibold text-foreground">No stops added yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Add your first city to start building your itinerary</p>
              <Button className="bg-accent hover:bg-accent/90 text-white" onClick={() => setShowAddStop(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Stop
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Stop Dialog */}
      <Dialog open={showAddStop} onOpenChange={setShowAddStop}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add a Stop</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Select City</Label>
              <Select value={addStopForm.cityId} onValueChange={(v) => setAddStopForm({ ...addStopForm, cityId: v })}>
                <SelectTrigger><SelectValue placeholder="Choose a city" /></SelectTrigger>
                <SelectContent>
                  {(cities || []).map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}, {c.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Arrival Date</Label>
                <Input type="date" value={addStopForm.arrivalDate} onChange={(e) => setAddStopForm({ ...addStopForm, arrivalDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <Input type="date" value={addStopForm.departureDate} min={addStopForm.arrivalDate || undefined} onChange={(e) => setAddStopForm({ ...addStopForm, departureDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Transportation</Label>
              <Input placeholder="e.g. Flight, Train, Car" value={addStopForm.transportation} onChange={(e) => setAddStopForm({ ...addStopForm, transportation: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Accommodation</Label>
              <Input placeholder="e.g. Hotel Marriott" value={addStopForm.accommodation} onChange={(e) => setAddStopForm({ ...addStopForm, accommodation: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStop(false)}>Cancel</Button>
            <Button className="bg-accent hover:bg-accent/90 text-white" onClick={handleAddStop}>Add Stop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Activity Dialog */}
      <Dialog open={!!showAddActivity} onOpenChange={() => setShowAddActivity(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Activity</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Select Activity</Label>
              <Select
                value={addActivityForm.activityId}
                onValueChange={(v) => {
                  const act = (activitiesForCity || []).find((a: any) => a._id === v);
                  setAddActivityForm({ ...addActivityForm, activityId: v, estimatedCost: act?.estimatedCost?.toString() || "0" });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Choose an activity" /></SelectTrigger>
                <SelectContent>
                  {(activitiesForCity || []).map((a: any) => (
                    <SelectItem key={a._id} value={a._id}>{a.name} (${a.estimatedCost})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={addActivityForm.date} min={activeStop?.arrivalDate} max={activeStop?.departureDate} onChange={(e) => setAddActivityForm({ ...addActivityForm, date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={addActivityForm.startTime} onChange={(e) => setAddActivityForm({ ...addActivityForm, startTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Est. Cost ($)</Label>
                <Input type="number" min="0" value={addActivityForm.estimatedCost} onChange={(e) => setAddActivityForm({ ...addActivityForm, estimatedCost: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input placeholder="Any notes..." value={addActivityForm.notes} onChange={(e) => setAddActivityForm({ ...addActivityForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddActivity(null)}>Cancel</Button>
            <Button className="bg-accent hover:bg-accent/90 text-white" onClick={handleAddActivity}>Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
