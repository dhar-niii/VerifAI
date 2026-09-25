import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Database, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SeedButton() {
  const isSeeded = useQuery(api.seed.checkSeeded);
  const seed = useMutation(api.seed.seedData);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seed();
      if (result === "already_seeded") {
        toast.info("Data already seeded!");
      } else {
        toast.success("Seed data loaded successfully!");
      }
    } catch {
      toast.error("Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  if (isSeeded) {
    return (
      <div className="flex items-center gap-1 text-xs text-emerald-600">
        <Check className="h-3 w-3" /> Data loaded
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
      {seeding ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Database className="mr-1 h-3 w-3" />}
      Load Demo Data
    </Button>
  );
}
