import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cities").collect();
  },
});

export const search = query({
  args: {
    searchTerm: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let cities = await ctx.db.query("cities").collect();
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      cities = cities.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.country.toLowerCase().includes(term)
      );
    }
    if (args.region) {
      cities = cities.filter((c) => c.region === args.region);
    }
    return cities.sort((a, b) => b.popularity - a.popularity);
  },
});

export const get = query({
  args: { id: v.id("cities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
