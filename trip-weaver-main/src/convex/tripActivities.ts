import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const add = mutation({
  args: {
    tripStopId: v.id("tripStops"),
    activityId: v.id("activities"),
    date: v.string(),
    startTime: v.optional(v.string()),
    notes: v.optional(v.string()),
    estimatedCost: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const stop = await ctx.db.get(args.tripStopId);
    if (!stop) throw new Error("Stop not found");
    const trip = await ctx.db.get(stop.tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    return await ctx.db.insert("tripActivities", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("tripActivities"),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    notes: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const ta = await ctx.db.get(args.id);
    if (!ta) throw new Error("Trip activity not found");
    const stop = await ctx.db.get(ta.tripStopId);
    if (!stop) throw new Error("Stop not found");
    const trip = await ctx.db.get(stop.tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tripActivities") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const ta = await ctx.db.get(args.id);
    if (!ta) throw new Error("Trip activity not found");
    const stop = await ctx.db.get(ta.tripStopId);
    if (!stop) throw new Error("Stop not found");
    const trip = await ctx.db.get(stop.tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});
