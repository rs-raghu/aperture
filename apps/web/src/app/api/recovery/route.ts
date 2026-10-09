import { handleRecoveryRequest } from "@/features/settings/recovery-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const GET = handleRecoveryRequest;
export const POST = handleRecoveryRequest;
