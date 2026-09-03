import type {
  ConfigurationValidationResult,
  PublicMobileConfiguration,
  PublicWebConfiguration,
  ServerOnlyWebConfiguration
} from "./config.types.js";

export declare function readPublicWebConfiguration(): PublicWebConfiguration;
export declare function readServerConfiguration(): ServerOnlyWebConfiguration;
export declare function readMobileConfiguration(): PublicMobileConfiguration;
export declare function validateConfiguration(
  configuration: unknown
): ConfigurationValidationResult;
