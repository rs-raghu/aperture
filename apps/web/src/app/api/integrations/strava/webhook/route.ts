import { handleStravaRequest } from "@/features/strava/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) { return handleStravaRequest(request, "verify"); }
export function POST(request: Request) { return handleStravaRequest(request, "webhook"); }
