import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

export function Seeder() {
  const isSeeded = useQuery(api.seed.checkSeeded);
  const seed = useMutation(api.seed.seedData);
  const hasSeeded = useRef(false);

  useEffect(() => {
    if (isSeeded === false && !hasSeeded.current) {
      hasSeeded.current = true;
      seed();
    }
  }, [isSeeded, seed]);

  return null;
}
