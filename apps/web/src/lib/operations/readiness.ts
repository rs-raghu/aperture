export async function readinessResponse(options: {
  readonly authenticate: () => Promise<boolean>;
  readonly probe: () => Promise<void>;
  readonly unavailable: () => void;
}): Promise<Response> {
  const respond = (status: number, state: string) => Response.json({ status: state }, { status, headers: { "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
  try {
    if (!await options.authenticate()) return respond(401, "owner-denied");
    await options.probe(); return respond(200, "ready");
  } catch { options.unavailable(); return respond(503, "unavailable"); }
}
