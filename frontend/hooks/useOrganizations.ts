import { useState, useEffect } from 'react';
import {
  organizationService,
  Organization,
} from '@/services/organization.service';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await organizationService.getAll();
      setOrganizations(res.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch organizations';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const createOrganization = async (name: string) => {
    const res = await organizationService.create({ name });
    setOrganizations((prev) => [...prev, res.data]);
    return res.data;
  };

  return {
    organizations,
    loading,
    error,
    createOrganization,
    refetch: fetchOrganizations,
  };
}
