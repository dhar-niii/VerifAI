import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const add = mutation({
  args: {
    tripId: v.id("trips"),
    category: v.string(),
    amount: v.number(),
    description: v.string(),
    date: v.string(),
    cityId: v.optional(v.id("cities")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    return await ctx.db.insert("expenses", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("expenses"),
    category: v.optional(v.string()),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const exp = await ctx.db.get(args.id);
    if (!exp) throw new Error("Expense not found");
    const trip = await ctx.db.get(exp.tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const exp = await ctx.db.get(args.id);
    if (!exp) throw new Error("Expense not found");
    const trip = await ctx.db.get(exp.tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const listByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const expenses = await ctx.db.query("expenses").withIndex("by_trip", (q) => q.eq("tripId", args.tripId)).collect();
    return Promise.all(
      expenses.map(async (exp) => {
        const city = exp.cityId ? await ctx.db.get(exp.cityId) : null;
        return { ...exp, city };
      })
    );
  },
});

export const summary = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const expenses = await ctx.db.query("expenses").withIndex("by_trip", (q) => q.eq("tripId", args.tripId)).collect();
    const categories: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    let total = 0;
    for (const exp of expenses) {
      total += exp.amount;
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
      if (exp.cityId) {
        const city = await ctx.db.get(exp.cityId);
        const cityName = city?.name || "Unknown";
        byCity[cityName] = (byCity[cityName] || 0) + exp.amount;
      }
    }
    return { total, categories, byCity, count: expenses.length };
  },
});
