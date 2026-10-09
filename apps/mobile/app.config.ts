import type { ConfigContext, ExpoConfig } from "expo/config";

export default function configureApplication({ config }: ConfigContext): ExpoConfig {
  const androidPackage = process.env.APERTURE_ANDROID_PACKAGE;
  const bundleIdentifier = process.env.APERTURE_IOS_BUNDLE_IDENTIFIER;
  const projectId = process.env.APERTURE_EAS_PROJECT_ID;
  if (androidPackage && !/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*){2,}$/.test(androidPackage)) throw new Error("Invalid Android application identifier.");
  if (bundleIdentifier && !/^[A-Za-z][A-Za-z0-9-]*(?:\.[A-Za-z][A-Za-z0-9-]*){2,}$/.test(bundleIdentifier)) throw new Error("Invalid iOS application identifier.");
  if (projectId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) throw new Error("Invalid EAS project identifier.");
  return {
    ...config, name: config.name ?? "Aperture", slug: config.slug ?? "aperture-mobile", scheme: "aperture",
    android: { ...config.android, ...(androidPackage ? { package: androidPackage } : {}) },
    ios: { ...config.ios, ...(bundleIdentifier ? { bundleIdentifier } : {}) },
    ...(projectId ? { extra: { ...config.extra, eas: { projectId } } } : {}),
  };
}
