import { useEffect, useState } from 'react';
import { getApiUrl } from '@shared/config/apiConfig';
import { useAuth } from '@auth/hooks/useAuth';

// Mirrors the CSM Angular app's allocation-based account filtering (see
// core/services/apps.service.ts getCustomerList() / GetCustomerIds, and
// project-selector.component.ts LoadCustomerByEmpId()) so AIMI's Account
// dropdown only shows accounts the logged-in employee is actually allocated
// to in PSA, instead of every account in the project hierarchy.
const CUSTOMER_IDS_ENDPOINT = '/api/AllSys/GetCustomerIds';

interface CustomerModel {
  cusT_ID: string;
  cusT_NM: string;
}

export const useAllocatedAccounts = () => {
  const { isAuthenticated } = useAuth();
  const [allocatedAccountNames, setAllocatedAccountNames] = useState<
    string[] | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setAllocatedAccountNames(null);
      setLoading(false);
      return;
    }

    const empId = localStorage.getItem('empid') || '';
    const token = localStorage.getItem('token') || '';

    if (!empId) {
      setAllocatedAccountNames([]);
      setLoading(false);
      return;
    }

    // The CSM Angular app already fetches and caches this exact allocation
    // list under this key at login time (apps.service.ts) - reuse that
    // cached response directly instead of calling the API a second time.
    const cached = localStorage.getItem('CustomerIds');
    if (cached) {
      try {
        const parsed: CustomerModel[] = JSON.parse(cached);
        setAllocatedAccountNames(
          Array.isArray(parsed)
            ? parsed.map((c) => c.cusT_NM).filter(Boolean)
            : []
        );
        setLoading(false);
        return;
      } catch (error) {
        console.warn(
          'Failed to parse cached CustomerIds, calling GetCustomerIds directly',
          error
        );
      }
    }

    let cancelled = false;

    const fetchAllocatedAccounts = async () => {
      setLoading(true);
      try {
        const url = `${getApiUrl(CUSTOMER_IDS_ENDPOINT)}?EmpId=${encodeURIComponent(
          empId
        )}&istoFindSLA=false`;
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            token,
            empId,
          },
        });

        if (!response.ok) {
          throw new Error(`GetCustomerIds failed: ${response.status}`);
        }

        const data: CustomerModel[] = await response.json();
        if (!cancelled) {
          setAllocatedAccountNames(
            Array.isArray(data) ? data.map((c) => c.cusT_NM).filter(Boolean) : []
          );
        }
      } catch (error) {
        console.error('Failed to fetch allocated accounts (GetCustomerIds):', error);
        if (!cancelled) {
          setAllocatedAccountNames([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllocatedAccounts();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return { allocatedAccountNames, loading };
};
