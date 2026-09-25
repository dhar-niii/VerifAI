import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, eachDayOfInterval, addDays } from "date-fns";
import { Calendar, MapPin, Clock, Compass, ChevronDown, ChevronUp, Wallet } from "lucide-react";

export default function CalendarPage() {
  const trips = useQuery(api.trips.list);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const stops = useQuery(
    api.stops.listByTrip,
    selectedTripId ? { tripId: selectedTripId as any } : "skip"
  );
  const trip = (trips || []).find((t: any) => t._id === selectedTripId);
  const navigate = useNavigate();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const timeline = useMemo(() => {
    if (!trip || !stops?.length) return [];
    const start = parseISO(trip.startDate);
    const end = parseISO(trip.endDate);
    const days = eachDayOfInterval({ start, end });

    return days.map((day, i) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayActivities: any[] = [];
      stops.forEach((stop: any) => {
        if (dateStr >= stop.arrivalDate && dateStr <= stop.departureDate) {
          const city = stop.city;
          stop.activities
            .filter((ta: any) => ta.date === dateStr)
            .forEach((ta: any) => {
              dayActivities.push({ ...ta, cityName: city?.name || "Unknown" });
            });
          if (dayActivities.length === 0 && i === 0) {
            dayActivities.push({ isArrival: true, cityName: city?.name || "Unknown" });
          }
        }
      });
      dayActivities.sort((a: any, b: any) => (a.startTime || "").localeCompare(b.startTime || ""));
      return { date: day, dateStr, dayNum: i + 1, activities: dayActivities };
    });
  }, [trip, stops]);

  const toggleDay = (dateStr: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trip Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">View your trip day by day</p>
        </div>

        <Select value={selectedTripId} onValueChange={setSelectedTripId}>
          <SelectTrigger className="w-full sm:w-64">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select a trip" />
          </SelectTrigger>
          <SelectContent>
            {(trips || []).map((t: any) => (
              <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!selectedTripId ? (
          <Card>
            <CardContent className="flex flex-col items-center py-20">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-semibold">Select a trip to view the timeline</p>
              <p className="text-sm text-muted-foreground mt-1">Choose a trip from the dropdown above</p>
            </CardContent>
          </Card>
        ) : timeline.length > 0 ? (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />
            <div className="space-y-4">
              {timeline.map((day) => {
                const isExpanded = expandedDays.has(day.dateStr) || day.activities.length > 0;
                return (
                  <div key={day.dateStr} className="relative sm:pl-14">
                    {/* Timeline dot */}
                    <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-accent border-4 border-background hidden sm:block z-10" />
                    <Card className="hover:shadow-md transition-shadow">
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer"
                        onClick={() => toggleDay(day.dateStr)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                          {day.dayNum}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            Day {day.dayNum} — {format(day.date, "EEEE")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(day.date, "MMMM d, yyyy")} · {day.activities.length} {day.activities.length === 1 ? "activity" : "activities"}
                          </p>
                        </div>
                        {day.activities.length > 0 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                              ${day.activities.reduce((s: number, a: any) => s + (a.estimatedCost || 0), 0)}
                            </span>
                          </div>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      {isExpanded && day.activities.length > 0 && (
                        <CardContent className="pt-0 pb-4">
                          <div className="border-t pt-3 space-y-2">
                            {day.activities.map((act: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                  {act.isArrival ? (
                                    <MapPin className="h-4 w-4 text-accent" />
                                  ) : (
                                    <Compass className="h-4 w-4 text-accent" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  {act.isArrival ? (
                                    <p className="text-sm font-medium text-foreground">Arrive in {act.cityName}</p>
                                  ) : (
                                    <>
                                      <p className="text-sm font-medium text-foreground">{act.activity?.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {act.cityName}
                                        {act.startTime && ` · ${act.startTime}`}
                                        {act.activity?.category && ` · ${act.activity.category}`}
                                      </p>
                                    </>
                                  )}
                                </div>
                                {!act.isArrival && (
                                  <span className="text-sm font-medium text-accent shrink-0">
                                    ${act.estimatedCost}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="font-semibold">No timeline data</p>
              <p className="text-sm text-muted-foreground mt-1">Add stops and activities to your trip first</p>
              <Button className="mt-4 bg-accent hover:bg-accent/90 text-white" onClick={() => navigate(`/trips/${selectedTripId}`)}>
                Edit Itinerary
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
