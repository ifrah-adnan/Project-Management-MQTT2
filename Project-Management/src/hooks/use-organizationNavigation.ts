import { useRouter, useSearchParams } from 'next/navigation';

export function useOrganizationNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const navigateWithOrganization = (path: string) => {
    const organizationId = searchParams.get('organizationId');
    if (organizationId) {
      router.push(`${path}?organizationId=${organizationId}`);
    } else {
      router.push(path);
    }
  };

  return navigateWithOrganization;
}