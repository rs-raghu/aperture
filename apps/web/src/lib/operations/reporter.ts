import "server-only";
import { randomUUID } from "node:crypto";
import { createOperationalReporter } from "./events";

// The optional monitoring hook accepts only this fixed, payload-free event schema.
// No external transport or SDK is configured by default.
export const reportOperationalEvent = createOperationalReporter({ now: () => new Date().toISOString(), id: randomUUID, write: (event) => console.warn(JSON.stringify(event)) });
