import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, MapPin, Star, DollarSign, Globe } from "lucide-react";

const regions = ["All Regions", "Europe", "Asia", "North America", "Middle East", "Africa"];

export default function CitySearch() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All Regions");
  const cities = useQuery(api.cities.search, {
    searchTerm: search || undefined,
    region: region !== "All Regions" ? region : undefined,
  });

  const costColors: Record<string, string> = {
    Low: "bg-emerald-500/10 text-emerald-600",
    Medium: "bg-amber-500/10 text-amber-600",
    High: "bg-red-500/10 text-red-600",
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Explore Cities</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover amazing destinations around the world</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-full sm:w-48">
              <Globe className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(cities || []).map((city: any) => (
            <Card key={city._id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3">
                  <Badge className={costColors[city.costLevel] || "bg-gray-100"}>
                    <DollarSign className="h-3 w-3 mr-0.5" />{city.costLevel}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white font-bold text-lg">{city.name}</h3>
                  <p className="text-white/70 text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {city.country}
                  </p>
                </div>
              </div>
              <CardContent className="p-4">
                {city.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{city.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-accent" fill="currentColor" />
                    <span className="font-medium">{city.popularity}</span>
                    <span className="text-muted-foreground text-xs">popularity</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{city.region}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {cities && cities.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold">No cities found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search term or region</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
