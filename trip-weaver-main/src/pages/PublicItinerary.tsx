import { useParams, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  Clock,
  Plane,
  Hotel,
  Share2,
  ExternalLink,
  User,
} from "lucide-react";

export default function PublicItinerary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trip = useQuery(api.trips.getPublic, id ? { id: id as any } : "skip");

  if (trip === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading itinerary...</div>
      </div>
    );
  }

  if (trip === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <Globe className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-xl font-semibold text-foreground">Trip not found or private</p>
        <p className="text-sm text-muted-foreground mt-1 mb-6">This itinerary may have been set to private.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const totalEstimated = trip.stops.reduce(
    (sum: number, stop: any) => sum + stop.activities.reduce((s: number, a: any) => s + a.estimatedCost, 0),
    0
  );

  const handleCopyTrip = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/70 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8 lg:py-12">
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 mb-4" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Home
          </Button>
          <Badge className="bg-accent text-white mb-3">Public Itinerary</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold">{trip.name}</h1>
          {trip.description && <p className="text-white/70 mt-2 text-lg">{trip.description}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/70">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(parseISO(trip.startDate), "MMM d")} – {format(parseISO(trip.endDate), "MMM d, yyyy")}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {trip.stops.length} stops</span>
            <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> ${totalEstimated.toLocaleString()} estimated</span>
            {trip.userName && <span className="flex items-center gap-1"><User className="h-4 w-4" /> by {trip.userName}</span>}
          </div>
          <div className="flex gap-3 mt-6">
            <Button className="bg-accent hover:bg-accent/90 text-white" onClick={handleCopyTrip}>
              <Share2 className="mr-2 h-4 w-4" /> Copy Link
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Budget Summary */}
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-accent">${trip.budget.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Budget</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${totalEstimated.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">${(trip.budget - totalEstimated).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stops & Activities */}
        {trip.stops.map((stop: any, idx: number) => (
          <Card key={stop._id} className="overflow-hidden">
            <div className="bg-secondary/50 px-5 py-3 border-b flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">{idx + 1}</div>
              <div>
                <h3 className="font-bold text-foreground">{stop.city?.name || "Unknown"}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(stop.arrivalDate), "MMM d")} – {format(parseISO(stop.departureDate), "MMM d")}
                </p>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              {stop.transportation && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Plane className="h-4 w-4" /> {stop.transportation}
                </div>
              )}
              {stop.accommodation && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hotel className="h-4 w-4" /> {stop.accommodation}
                </div>
              )}
              {stop.activities.length > 0 ? (
                stop.activities.map((ta: any) => (
                  <div key={ta._id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Compass className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{ta.activity?.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{ta.date}</span>
                        {ta.startTime && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{ta.startTime}</span>}
                        <Badge variant="secondary" className="text-[10px]">{ta.activity?.category}</Badge>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-accent">${ta.estimatedCost}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3">No activities listed</p>
              )}
            </CardContent>
          </Card>
        ))}

        <Separator />

        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Created with</p>
          <p className="font-bold text-foreground flex items-center justify-center gap-1">
            <Globe className="h-4 w-4 text-accent" /> GlobeTrotter
          </p>
        </div>
      </div>
    </div>
  );
}
