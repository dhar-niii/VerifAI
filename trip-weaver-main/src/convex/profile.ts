import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      language: user.language,
      favoriteDestinations: user.favoriteDestinations,
    };
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    language: v.optional(v.string()),
    favoriteDestinations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, args);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const trips = await ctx.db.query("trips").withIndex("by_user", (q) => q.eq("userId", userId!)).collect();
    let totalSpent = 0;
    for (const trip of trips) {
      const expenses = await ctx.db.query("expenses").withIndex("by_trip", (q) => q.eq("tripId", trip._id)).collect();
      totalSpent += expenses.reduce((sum, e) => sum + e.amount, 0);
    }
    return {
      totalTrips: trips.length,
      totalSpent,
    };
  },
});
