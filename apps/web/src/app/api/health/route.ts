export const dynamic = "force-dynamic";
export function GET(): Response {
  return Response.json({ status: "ok", service: "aperture-web" }, { headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}
