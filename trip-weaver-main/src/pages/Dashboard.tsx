import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  Map,
  PlusCircle,
  Wallet,
  Compass,
  CalendarDays,
  ArrowRight,
  Globe,
  TrendingUp,
  MapPin,
  Plane,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const trips = useQuery(api.trips.listWithDetails);
  const profile = useQuery(api.profile.stats);
  const cities = useQuery(api.cities.list);

  const today = format(new Date(), "yyyy-MM-dd");
  const upcoming = trips?.filter((t) => t.endDate >= today) || [];
  const past = trips?.filter((t) => t.endDate < today) || [];
  const nextTrip = upcoming[0];

  const popularCities = cities
    ?.sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6) || [];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="text-sm text-muted-foreground font-medium">Welcome back</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">
              {user?.name || "Traveler"} ✈️
            </h1>
            <p className="text-muted-foreground mt-1">Where are you heading next?</p>
          </div>
          <Button
            className="bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg shadow-accent/20"
            onClick={() => navigate("/trips/new")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Plan New Trip
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Trips", value: profile?.totalTrips ?? (trips?.length ?? 0), icon: Map, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Upcoming", value: upcoming.length, icon: Plane, color: "text-accent", bg: "bg-accent/10" },
            { label: "Total Spent", value: `$${(profile?.totalSpent ?? 0).toLocaleString()}`, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Cities Explored", value: popularCities.length, icon: Globe, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-xl lg:text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Next Upcoming Trip */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Trip</CardTitle>
                  {upcoming.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>
                      View all <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {nextTrip ? (
                  <div
                    className="relative overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => navigate(`/trips/${nextTrip._id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
                    <div className="relative p-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-accent/20 text-accent border-0 text-xs">Upcoming</Badge>
                      </div>
                      <h3 className="text-xl font-bold">{nextTrip.name}</h3>
                      <p className="text-white/60 text-sm mt-1">
                        {format(parseISO(nextTrip.startDate), "MMM d")} – {format(parseISO(nextTrip.endDate), "MMM d, yyyy")}
                      </p>
                      <div className="flex items-center gap-6 mt-4 text-sm text-white/70">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {nextTrip.stopsCount} {nextTrip.stopsCount === 1 ? "stop" : "stops"}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" /> {differenceInDays(parseISO(nextTrip.endDate), parseISO(nextTrip.startDate))} days
                        </span>
                        <span className="flex items-center gap-1">
                          <Wallet className="h-3.5 w-3.5" /> ${nextTrip.budget.toLocaleString()}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="mt-4 bg-white/10 hover:bg-white/20 text-white border-white/20"
                      >
                        Continue Planning <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-12 text-center cursor-pointer group"
                    onClick={() => navigate("/trips/new")}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <Plane className="h-8 w-8 text-accent" />
                    </div>
                    <p className="font-semibold text-foreground">No upcoming trips</p>
                    <p className="text-sm text-muted-foreground mt-1">Start planning your next adventure!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Trips */}
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Trips</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>
                    View all <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {trips && trips.length > 0 ? (
                  <div className="space-y-3">
                    {trips.slice(0, 4).map((trip) => (
                      <div
                        key={trip._id}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/trips/${trip._id}`)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Map className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{trip.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(trip.startDate), "MMM d")} – {format(parseISO(trip.endDate), "MMM d, yyyy")} · {trip.stopsCount} stops
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-foreground">${trip.totalSpent.toLocaleString()}</p>
                          <Badge variant={trip.endDate >= today ? "default" : "secondary"} className="text-[10px] mt-1">
                            {trip.endDate >= today ? "Upcoming" : "Completed"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No trips yet. Create your first trip!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: PlusCircle, label: "Create New Trip", to: "/trips/new", accent: true },
                  { icon: Compass, label: "Explore Cities", to: "/explore" },
                  { icon: Map, label: "My Trips", to: "/trips" },
                  { icon: Globe, label: "Shared Itineraries", to: "/shared" },
                  { icon: Wallet, label: "View Budget", to: "/budget" },
                ].map((a) => (
                  <Button
                    key={a.label}
                    variant={a.accent ? "default" : "ghost"}
                    className={`w-full justify-start ${a.accent ? "bg-accent hover:bg-accent/90 text-white" : ""}`}
                    onClick={() => navigate(a.to)}
                  >
                    <a.icon className="mr-2 h-4 w-4" />
                    {a.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Popular Destinations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Popular Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularCities.map((city) => (
                    <button
                      key={city._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-accent/10 text-sm text-foreground transition-colors"
                      onClick={() => navigate("/explore")}
                    >
                      <MapPin className="h-3 w-3 text-accent" />
                      {city.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  <p className="text-3xl font-bold text-foreground">${(profile?.totalSpent ?? 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total estimated spending</p>
                  <div className="w-full bg-secondary rounded-full h-2 mt-4">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(((profile?.totalSpent ?? 0) / 10000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
