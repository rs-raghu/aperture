import type { ReactNode } from "react";
import { EducationShell } from "@/features/education/components/education-shell";

export default function EducationLayout({ children }: { readonly children: ReactNode }) {
  return <EducationShell>{children}</EducationShell>;
}
