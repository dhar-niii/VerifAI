import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { format, parseISO } from "date-fns";
import { Globe, MapPin, Calendar, Eye, Compass } from "lucide-react";

export default function SharedTrips() {
  const navigate = useNavigate();
  // We query all trips with visibility=public - since Convex doesn't have a direct
  // "list public" query, we'll use a workaround. For now, show a message.
  // In a real app, we'd have a dedicated public trips query.
  const allTrips = useQuery(api.trips.listWithDetails);
  
  // Filter for public trips (note: this only shows the current user's public trips
  // in this demo - a real app would have a public listings query)
  const publicTrips = (allTrips || []).filter((t: any) => t.visibility === "public");

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shared Trips</h1>
          <p className="text-sm text-muted-foreground mt-1">Explore publicly shared itineraries</p>
        </div>

        {publicTrips.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicTrips.map((trip: any) => (
              <Card key={trip._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate(`/public/${trip._id}`)}>
                <div className="h-36 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center relative">
                  {trip.coverImage ? (
                    <img src={trip.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Globe className="h-12 w-12 text-white/30" />
                  )}
                  <Badge className="absolute top-3 left-3 bg-emerald-500 text-white">Public</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-foreground">{trip.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(parseISO(trip.startDate), "MMM d")}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.stopsCount} stops</span>
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => navigate(`/public/${trip._id}`)}>
                    <Eye className="mr-1 h-3 w-3" /> View Itinerary
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <Compass className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-semibold text-foreground">No shared trips yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Create a trip and share it publicly to see it here!</p>
              <Button className="bg-accent hover:bg-accent/90 text-white" onClick={() => navigate("/trips/new")}>
                Create a Trip
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
