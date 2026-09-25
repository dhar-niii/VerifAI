import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const add = mutation({
  args: {
    tripId: v.id("trips"),
    cityId: v.id("cities"),
    arrivalDate: v.string(),
    departureDate: v.string(),
    orderIndex: v.number(),
    transportation: v.optional(v.string()),
    accommodation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    return await ctx.db.insert("tripStops", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("tripStops"),
    arrivalDate: v.optional(v.string()),
    departureDate: v.optional(v.string()),
    orderIndex: v.optional(v.number()),
    transportation: v.optional(v.string()),
    accommodation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const stop = await ctx.db.get(args.id);
    if (!stop) throw new Error("Stop not found");
    const trip = await ctx.db.get(stop.tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tripStops") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const stop = await ctx.db.get(args.id);
    if (!stop) throw new Error("Stop not found");
    const trip = await ctx.db.get(stop.tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    const activities = await ctx.db.query("tripActivities").withIndex("by_stop", (q) => q.eq("tripStopId", args.id)).collect();
    for (const act of activities) await ctx.db.delete(act._id);
    await ctx.db.delete(args.id);
  },
});

export const listByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const stops = await ctx.db.query("tripStops").withIndex("by_trip", (q) => q.eq("tripId", args.tripId)).collect();
    const sorted = stops.sort((a, b) => a.orderIndex - b.orderIndex);
    return await Promise.all(
      sorted.map(async (stop) => {
        const city = await ctx.db.get(stop.cityId);
        const tripActivities = await ctx.db.query("tripActivities").withIndex("by_stop", (q) => q.eq("tripStopId", stop._id)).collect();
        const activitiesWithDetails = await Promise.all(
          tripActivities.map(async (ta) => {
            const activity = await ctx.db.get(ta.activityId);
            return { ...ta, activity };
          })
        );
        return { ...stop, city, activities: activitiesWithDetails };
      })
    );
  },
});
