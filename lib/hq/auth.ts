import 'server-only';

import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

export type HqActor = {
  userId: string;
  email: string | null;
  displayName: string | null;
  roles: string[];
  permissions: Set<string>;
};

/**
 * Resolves the caller's identity and effective permissions for a route handler.
 *
 * Permissions are computed from the DB (roles -> role_permissions, plus per-user
 * overrides) and never from auth metadata, which a user can influence.
 */
export async function getActor(): Promise<HqActor | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createSupabaseServiceClient();

  const { data: member } = await admin
    .from('members')
    .select('user_id, email, display_name, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (!member) return null;

  const { data: roleRows } = await admin
    .from('user_roles')
    .select('role_slug')
    .eq('user_id', user.id);
  const roles = (roleRows ?? []).map((r: { role_slug: string }) => r.role_slug);

  const permissions = new Set<string>();
  if (roles.length) {
    const { data: perms } = await admin
      .from('role_permissions')
      .select('permission_key')
      .in('role_slug', roles);
    (perms ?? []).forEach((p: { permission_key: string }) => permissions.add(p.permission_key));
  }

  const { data: overrides } = await admin
    .from('user_permission_overrides')
    .select('permission_key, allowed')
    .eq('user_id', user.id);
  (overrides ?? []).forEach((o: { permission_key: string; allowed: boolean }) => {
    if (o.allowed) permissions.add(o.permission_key);
    else permissions.delete(o.permission_key);
  });

  return {
    userId: member.user_id,
    email: member.email,
    displayName: member.display_name,
    roles,
    permissions,
  };
}

export class HqAuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/** Throws HqAuthError unless the caller is an active member holding `permission`. */
export async function requirePermission(permission: string): Promise<HqActor> {
  const actor = await getActor();
  if (!actor) throw new HqAuthError(401, 'Not signed in, or not a member.');
  if (!actor.permissions.has(permission)) {
    throw new HqAuthError(403, `Missing permission: ${permission}`);
  }
  return actor;
}

/** Records a privileged action. Never allowed to break the operation it is logging. */
export async function audit(
  actorId: string | null,
  action: string,
  targetType?: string,
  targetId?: string,
  detail: Record<string, unknown> = {}
): Promise<void> {
  try {
    const admin = createSupabaseServiceClient();
    await admin.from('audit_log').insert({
      actor_id: actorId,
      action,
      target_type: targetType ?? null,
      target_id: targetId ?? null,
      detail,
    });
  } catch {
    // Audit is best-effort.
  }
}
