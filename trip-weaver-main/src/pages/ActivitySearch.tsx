import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Clock, DollarSign, MapPin, Compass } from "lucide-react";

const categories = [
  "All Categories",
  "Sightseeing",
  "Food",
  "Adventure",
  "Culture",
  "Shopping",
  "Entertainment",
  "Nature",
];

const categoryColors: Record<string, string> = {
  Sightseeing: "bg-blue-500/10 text-blue-600",
  Food: "bg-orange-500/10 text-orange-600",
  Adventure: "bg-red-500/10 text-red-600",
  Culture: "bg-purple-500/10 text-purple-600",
  Shopping: "bg-pink-500/10 text-pink-600",
  Entertainment: "bg-yellow-500/10 text-yellow-600",
  Nature: "bg-green-500/10 text-green-600",
};

export default function ActivitySearch() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const cities = useQuery(api.cities.list);
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const activities = useQuery(api.activities.search, {
    searchTerm: search || undefined,
    category: category !== "All Categories" ? category : undefined,
    cityId: selectedCity !== "all" ? (selectedCity as any) : undefined,
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discover Activities</h1>
          <p className="text-sm text-muted-foreground mt-1">Find amazing things to do at your destinations</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Compass className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full sm:w-48">
              <MapPin className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {(cities || []).map((c: any) => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(activities || []).map((act: any) => (
            <Card key={act._id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              {act.image && (
                <div className="h-40 overflow-hidden">
                  <img src={act.image} alt={act.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{act.name}</h3>
                  <Badge className={categoryColors[act.category] || "bg-gray-100"}>{act.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{act.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {act.city && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{act.city.name}</span>
                  )}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{act.duration}h</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{act.estimatedCost > 0 ? `$${act.estimatedCost}` : "Free"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activities && activities.length === 0 && (
          <div className="text-center py-16">
            <Compass className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold">No activities found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
