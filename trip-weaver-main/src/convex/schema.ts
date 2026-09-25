import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      language: v.optional(v.string()),
      favoriteDestinations: v.optional(v.array(v.string())),
    }).index("email", ["email"]),

    cities: defineTable({
      name: v.string(),
      country: v.string(),
      region: v.string(),
      popularity: v.number(),
      costLevel: v.string(),
      image: v.string(),
      description: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
    }).index("by_name", ["name"])
      .index("by_country", ["country"])
      .index("by_popularity", ["popularity"]),

    activities: defineTable({
      cityId: v.id("cities"),
      name: v.string(),
      description: v.string(),
      category: v.string(),
      duration: v.number(),
      estimatedCost: v.number(),
      image: v.optional(v.string()),
    }).index("by_city", ["cityId"])
      .index("by_category", ["category"]),

    trips: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      startDate: v.string(),
      endDate: v.string(),
      coverImage: v.optional(v.string()),
      budget: v.number(),
      visibility: v.union(v.literal("private"), v.literal("public")),
    }).index("by_user", ["userId"])
      .index("by_visibility", ["visibility"]),

    tripStops: defineTable({
      tripId: v.id("trips"),
      cityId: v.id("cities"),
      arrivalDate: v.string(),
      departureDate: v.string(),
      orderIndex: v.number(),
      transportation: v.optional(v.string()),
      accommodation: v.optional(v.string()),
    }).index("by_trip", ["tripId"])
      .index("by_trip_order", ["tripId", "orderIndex"]),

    tripActivities: defineTable({
      tripStopId: v.id("tripStops"),
      activityId: v.id("activities"),
      date: v.string(),
      startTime: v.optional(v.string()),
      notes: v.optional(v.string()),
      estimatedCost: v.number(),
    }).index("by_stop", ["tripStopId"])
      .index("by_stop_date", ["tripStopId", "date"]),

    expenses: defineTable({
      tripId: v.id("trips"),
      category: v.string(),
      amount: v.number(),
      description: v.string(),
      date: v.string(),
      cityId: v.optional(v.id("cities")),
    }).index("by_trip", ["tripId"])
      .index("by_trip_category", ["tripId", "category"]),

    favorites: defineTable({
      userId: v.id("users"),
      cityId: v.id("cities"),
    }).index("by_user", ["userId"])
      .index("by_user_city", ["userId", "cityId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
