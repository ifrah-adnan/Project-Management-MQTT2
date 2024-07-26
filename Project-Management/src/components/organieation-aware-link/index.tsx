import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface OrganizationAwareLinkProps {
  href: string;
  children: React.ReactNode;
}

export function OrganizationAwareLink({
  href,
  children,
}: OrganizationAwareLinkProps) {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");

  const fullHref = organizationId
    ? `${href}?organizationId=${organizationId}`
    : href;

  return <Link href={fullHref}>{children}</Link>;
}
