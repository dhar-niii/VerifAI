import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  PlusCircle,
  Map,
  MapPin,
  CalendarDays,
  Wallet,
  Trash2,
  Eye,
  Pencil,
  Share2,
  Search,
  Compass,
} from "lucide-react";

export default function MyTrips() {
  const navigate = useNavigate();
  const trips = useQuery(api.trips.listWithDetails);
  const removeTrip = useMutation(api.trips.remove);
  const updateTrip = useMutation(api.trips.update);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  const filtered = (trips || []).filter((t) => {
    if (filter === "upcoming") return t.endDate >= today;
    if (filter === "completed") return t.endDate < today;
    return true;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await removeTrip({ id: deleteId as any });
      toast.success("Trip deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete trip");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async (trip: any) => {
    const newVisibility = trip.visibility === "public" ? "private" : "public";
    try {
      await updateTrip({ id: trip._id, visibility: newVisibility });
      toast.success(newVisibility === "public" ? "Trip is now public!" : "Trip is now private");
    } catch {
      toast.error("Failed to update trip visibility");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Trips</h1>
            <p className="text-sm text-muted-foreground mt-1">{trips?.length || 0} trips planned</p>
          </div>
          <Button
            className="bg-accent hover:bg-accent/90 text-white font-semibold"
            onClick={() => navigate("/trips/new")}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> New Trip
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "upcoming", "completed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className={filter === f ? "bg-primary text-primary-foreground" : ""}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Trip Cards */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((trip) => {
              const days = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate));
              const isUpcoming = trip.endDate >= today;
              return (
                <Card key={trip._id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div
                    className="relative h-40 bg-gradient-to-br from-primary to-primary/70 cursor-pointer"
                    onClick={() => navigate(`/trips/${trip._id}`)}
                  >
                    {trip.coverImage && (
                      <img src={trip.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={isUpcoming ? "bg-accent text-white" : "bg-white/20 text-white"}>
                        {isUpcoming ? "Upcoming" : "Completed"}
                      </Badge>
                      {trip.visibility === "public" && (
                        <Badge className="bg-emerald-500 text-white">Public</Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg leading-tight">{trip.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {format(parseISO(trip.startDate), "MMM d")} – {format(parseISO(trip.endDate), "MMM d")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {trip.stopsCount} stops
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet className="h-3.5 w-3.5" /> ${trip.budget.toLocaleString()} budget
                      </span>
                      <span className="flex items-center gap-1">
                        <Map className="h-3.5 w-3.5" /> {days} days
                      </span>
                    </div>
                    {trip.totalSpent > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Spent</span>
                          <span className="font-medium">${trip.totalSpent.toLocaleString()} / ${trip.budget.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${trip.totalSpent > trip.budget ? "bg-destructive" : "bg-accent"}`}
                            style={{ width: `${Math.min((trip.totalSpent / trip.budget) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-white" onClick={() => navigate(`/trips/${trip._id}`)}>
                        <Pencil className="mr-1 h-3 w-3" /> Plan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleShare(trip)}>
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/public/${trip._id}`)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(trip._id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Compass className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">No trips yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Create your first trip to get started!</p>
            <Button className="bg-accent hover:bg-accent/90 text-white" onClick={() => navigate("/trips/new")}>
              <PlusCircle className="mr-2 h-4 w-4" /> Plan Your First Trip
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All stops, activities, and expenses will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function differenceInDays(end: Date, start: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
}
