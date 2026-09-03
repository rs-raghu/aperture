import type {
  ConnectIntegrationInput,
  IntegrationConnection,
  IntegrationConnectionId,
  IntegrationDescriptor,
  IntegrationId,
  IntegrationListQuery
} from "./integration.types.js";

export declare function connectIntegration(
  input: ConnectIntegrationInput
): Promise<IntegrationConnection>;
export declare function disconnectIntegration(
  connectionId: IntegrationConnectionId
): Promise<void>;
export declare function getIntegrationStatus(
  connectionId: IntegrationConnectionId
): Promise<IntegrationConnection>;
export declare function listIntegrations(
  query: IntegrationListQuery
): Promise<readonly IntegrationDescriptor[]>;
export declare function requestIntegrationSynchronization(
  connectionId: IntegrationConnectionId
): Promise<void>;
export declare function recordIntegrationError(
  integrationId: IntegrationId,
  errorCode: string
): Promise<void>;
