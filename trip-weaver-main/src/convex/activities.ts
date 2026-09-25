import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: { cityId: v.optional(v.id("cities")) },
  handler: async (ctx, args) => {
    if (args.cityId) {
      return await ctx.db
        .query("activities")
        .withIndex("by_city", (q) => q.eq("cityId", args.cityId!))
        .collect();
    }
    return await ctx.db.query("activities").collect();
  },
});

export const search = query({
  args: {
    searchTerm: v.optional(v.string()),
    category: v.optional(v.string()),
    cityId: v.optional(v.id("cities")),
  },
  handler: async (ctx, args) => {
    let activities = args.cityId
      ? await ctx.db.query("activities").withIndex("by_city", (q) => q.eq("cityId", args.cityId!)).collect()
      : await ctx.db.query("activities").collect();

    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      activities = activities.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term)
      );
    }
    if (args.category) {
      activities = activities.filter((a) => a.category === args.category);
    }

    const result = await Promise.all(
      activities.map(async (a) => {
        const city = await ctx.db.get(a.cityId);
        return { ...a, city };
      })
    );
    return result;
  },
});

export const get = query({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.id);
    if (!activity) return null;
    const city = await ctx.db.get(activity.cityId);
    return { ...activity, city };
  },
});
