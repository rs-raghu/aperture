export function isPublicOperationalRoute(pathname: string): boolean {
  return pathname === "/api/health" || pathname === "/manifest.webmanifest" || pathname === "/icon.svg";
}
