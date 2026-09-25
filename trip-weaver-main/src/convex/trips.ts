import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    coverImage: v.optional(v.string()),
    budget: v.number(),
    visibility: v.union(v.literal("private"), v.literal("public")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("trips", { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id("trips"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    budget: v.optional(v.number()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trip = await ctx.db.get(args.id);
    if (!trip) throw new Error("Trip not found");
    if (trip.userId !== userId) throw new Error("Unauthorized");
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trip = await ctx.db.get(args.id);
    if (!trip) throw new Error("Trip not found");
    if (trip.userId !== userId) throw new Error("Unauthorized");
    // Delete related stops, activities, and expenses
    const stops = await ctx.db.query("tripStops").withIndex("by_trip", (q) => q.eq("tripId", args.id)).collect();
    for (const stop of stops) {
      const activities = await ctx.db.query("tripActivities").withIndex("by_stop", (q) => q.eq("tripStopId", stop._id)).collect();
      for (const act of activities) await ctx.db.delete(act._id);
      await ctx.db.delete(stop._id);
    }
    const expenses = await ctx.db.query("expenses").withIndex("by_trip", (q) => q.eq("tripId", args.id)).collect();
    for (const exp of expenses) await ctx.db.delete(exp._id);
    await ctx.db.delete(args.id);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("trips").withIndex("by_user", (q) => q.eq("userId", userId!)).collect();
  },
});

export const get = query({
  args: { id: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPublic = query({
  args: { id: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.id);
    if (!trip || trip.visibility !== "public") return null;
    const user = await ctx.db.get(trip.userId);
    const stops = await ctx.db.query("tripStops").withIndex("by_trip", (q) => q.eq("tripId", args.id)).collect();
    const stopsWithDetails = await Promise.all(
      stops.map(async (stop) => {
        const city = await ctx.db.get(stop.cityId);
        const activities = await ctx.db.query("tripActivities").withIndex("by_stop", (q) => q.eq("tripStopId", stop._id)).collect();
        const activitiesWithDetails = await Promise.all(
          activities.map(async (ta) => {
            const activity = await ctx.db.get(ta.activityId);
            return { ...ta, activity };
          })
        );
        return { ...stop, city, activities: activitiesWithDetails };
      })
    );
    const expenses = await ctx.db.query("expenses").withIndex("by_trip", (q) => q.eq("tripId", args.id)).collect();
    return { ...trip, userName: user?.name, stops: stopsWithDetails, expenses };
  },
});

export const listWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const trips = await ctx.db.query("trips").withIndex("by_user", (q) => q.eq("userId", userId!)).collect();
    return await Promise.all(
      trips.map(async (trip) => {
        const stops = await ctx.db.query("tripStops").withIndex("by_trip", (q) => q.eq("tripId", trip._id)).collect();
        const expenses = await ctx.db.query("expenses").withIndex("by_trip", (q) => q.eq("tripId", trip._id)).collect();
        return { ...trip, stopsCount: stops.length, totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0) };
      })
    );
  },
});
