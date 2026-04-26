'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FolderKanban,
  Building2,
  ChevronDown,
  Loader2,
  UserPlus,
  Users,
  Shield,
  User2,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useProjects } from '@/hooks/useProjects';
import { projectService } from '@/services/project.service';
import type { Project, ProjectMemberInfo } from '@/services/project.service';

export default function ProjectsClient() {
  const {
    organizations,
    loading: orgsLoading,
    createOrganization,
  } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const activeOrgId = selectedOrgId ?? organizations[0]?._id ?? null;
  const activeOrg = organizations.find((o) => o._id === activeOrgId);

  const {
    projects,
    loading: projectsLoading,
    createProject,
  } = useProjects(activeOrgId);

  // New Org dialog
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSubmitting, setOrgSubmitting] = useState(false);

  // New Project dialog
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  // Invite member dialog
  const [inviteProject, setInviteProject] = useState<Project | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);

  // Member counts per project
  const [memberMap, setMemberMap] = useState<
    Record<string, ProjectMemberInfo[]>
  >({});

  // Load members for all visible projects
  useEffect(() => {
    if (!projects.length) return;
    projects.forEach((p) => {
      if (memberMap[p._id]) return; // already loaded
      projectService
        .getMembers(p._id)
        .then((res) => {
          setMemberMap((prev) => ({ ...prev, [p._id]: res.data }));
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const handleCreateOrg = async () => {
    if (!orgName.trim()) return;
    setOrgSubmitting(true);
    try {
      const org = await createOrganization(orgName.trim());
      setSelectedOrgId(org._id);
      setOrgName('');
      setOrgDialogOpen(false);
    } finally {
      setOrgSubmitting(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim() || !activeOrgId) return;
    setProjectSubmitting(true);
    try {
      await createProject(projectName.trim());
      setProjectName('');
      setProjectDialogOpen(false);
    } finally {
      setProjectSubmitting(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !inviteProject) return;
    setInviteSubmitting(true);
    setInviteResult(null);
    try {
      const res = await projectService.addMember(inviteProject._id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteResult((res.data as { message: string }).message);
      setInviteEmail('');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to send invitation';
      setInviteResult(msg);
    } finally {
      setInviteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-500 mt-1">
            Manage and track all your projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* New Org */}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setOrgDialogOpen(true)}
          >
            <Building2 className="w-4 h-4" />
            New Organization
          </Button>
          <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="Organization name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateOrg()}
                />
                <Button
                  className="w-full"
                  onClick={handleCreateOrg}
                  disabled={orgSubmitting || !orgName.trim()}
                >
                  {orgSubmitting && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Create Organization
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* New Project */}
          <Button
            className="gap-2"
            disabled={!activeOrgId}
            onClick={() => setProjectDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
          <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-gray-500">
                  Organization:{' '}
                  <span className="font-medium text-gray-800">
                    {activeOrg?.name}
                  </span>
                </p>
                <Input
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <Button
                  className="w-full"
                  onClick={handleCreateProject}
                  disabled={projectSubmitting || !projectName.trim()}
                >
                  {projectSubmitting && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Body */}
      {orgsLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading organizations…
        </div>
      ) : organizations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
          <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No organizations yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create an organization to start managing projects.
          </p>
        </div>
      ) : (
        <>
          {/* Org Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Organization:</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="gap-2 h-9 text-sm">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    {activeOrg?.name ?? 'Select'}
                    <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org._id}
                    onClick={() => setSelectedOrgId(org._id)}
                    className={
                      activeOrgId === org._id ? 'bg-blue-50 text-blue-600' : ''
                    }
                  >
                    {org.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading projects…
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
              <FolderKanban className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No projects yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Click &quot;New Project&quot; to create your first one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, i) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                        <FolderKanban className="w-4 h-4 text-blue-500" />
                      </div>
                      <CardTitle className="text-sm font-semibold flex-1 truncate">
                        {project.name}
                      </CardTitle>
                      {/* Role badge */}
                      <span
                        className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          project.currentUserRole === 'admin'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {project.currentUserRole === 'admin' ? (
                          <>
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </>
                        ) : (
                          <>
                            <User2 className="w-2.5 h-2.5" /> Member
                          </>
                        )}
                      </span>
                      {/* Invite button — admin only */}
                      {project.currentUserRole === 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 gap-1 text-xs shrink-0"
                          onClick={() => {
                            setInviteProject(project);
                            setInviteEmail('');
                            setInviteRole('member');
                            setInviteResult(null);
                          }}
                        >
                          <UserPlus className="w-3 h-3" />
                          Invite
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {memberMap[project._id]
                            ? `${memberMap[project._id].length} member${
                                memberMap[project._id].length !== 1 ? 's' : ''
                              }`
                            : '…'}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" />
                          Created{' '}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {/* Member avatars */}
                      {memberMap[project._id]?.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {memberMap[project._id].slice(0, 5).map((m) => (
                            <div
                              key={m.userId}
                              title={`${m.name} (${m.role})`}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ${
                                m.role === 'admin'
                                  ? 'bg-blue-200 text-blue-700'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {memberMap[project._id].length > 5 && (
                            <span className="text-[10px] text-gray-400 ml-0.5">
                              +{memberMap[project._id].length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Invite Member Dialog */}
      <Dialog
        open={!!inviteProject}
        onOpenChange={(open) => {
          if (!open) {
            setInviteProject(null);
            setInviteResult(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500">
              Project:{' '}
              <span className="font-medium text-gray-800">
                {inviteProject?.name}
              </span>
            </p>
            <Input
              placeholder="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInviteMember()}
            />
            {/* Role selector */}
            <div className="flex gap-2">
              {(['member', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setInviteRole(r)}
                  className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    inviteRole === r
                      ? 'bg-blue-50 border-blue-400 text-blue-600'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            {inviteResult && (
              <p
                className={`text-sm rounded-lg px-3 py-2 ${
                  inviteResult.toLowerCase().includes('added') ||
                  inviteResult.toLowerCase().includes('saved')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {inviteResult}
              </p>
            )}
            <Button
              className="w-full"
              onClick={handleInviteMember}
              disabled={inviteSubmitting || !inviteEmail.trim()}
            >
              {inviteSubmitting && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
