import { useState, useEffect, useCallback } from 'react';
import { projectService, Project } from '@/services/project.service';

export function useProjects(orgId: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await projectService.getByOrg(orgId);
      setProjects(res.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (name: string) => {
    if (!orgId) throw new Error('No organization selected');
    const res = await projectService.create(orgId, { name });
    setProjects((prev) => [...prev, res.data]);
    return res.data;
  };

  return { projects, loading, error, createProject, refetch: fetchProjects };
}
