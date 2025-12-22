"use client";

import { usePathname } from "next/navigation";
import LayoutWrapper from "./LayoutWrapper";

interface LayoutControllerProps {
  children: React.ReactNode;
}

export default function LayoutController({ children }: LayoutControllerProps) {
  const pathname = usePathname();

  // Pages that should NOT use the LayoutWrapper (public pages)
  const publicPages = ["/", "/login", "/contact"];
  const isPublicPage = publicPages.includes(pathname || "");

  // Use LayoutWrapper for authenticated/dashboard pages
  if (!isPublicPage) {
    return <LayoutWrapper>{children}</LayoutWrapper>;
  }

  // Return children directly for public pages
  return <>{children}</>;
}
