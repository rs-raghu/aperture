import { createRunningActivityInputSchema, updateRunningActivityInputSchema } from "@aperture/health";
import { stravaActivitySchema } from "./strava.types.js";

export function mapStravaActivity(value: unknown) {
  const activity = stravaActivitySchema.parse(value);
  if (!["Run", "TrailRun", "VirtualRun"].includes(activity.sport_type)) return null;
  const create = createRunningActivityInputSchema.unwrap().omit({ ownerId: true }).parse({ title: activity.name, startedAt: activity.start_date });
  const endedAt = new Date(Date.parse(activity.start_date) + activity.elapsed_time * 1000).toISOString();
  const update = updateRunningActivityInputSchema.parse({
    title: activity.name, startedAt: activity.start_date, endedAt,
    distance: { value: String(activity.distance), unit: "meter" }, duration: { value: String(activity.moving_time), unit: "second" },
  });
  return { create, update };
}
