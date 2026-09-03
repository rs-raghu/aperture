import type { ReactNode } from "react";
import { EducationProvider } from "@/features/education/providers/education-provider";
import { EducationShell } from "@/features/education/components/education-shell";

export default function EducationLayout({ children }: { readonly children: ReactNode }) {
  return <EducationProvider><EducationShell>{children}</EducationShell></EducationProvider>;
}
