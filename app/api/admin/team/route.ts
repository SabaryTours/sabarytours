import { NextResponse } from "next/server";
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_OPTIONS,
  ADMIN_ROLE_PRESETS,
  isAdminRole,
  normalizePermissions,
  type AdminPermission,
} from "../../../lib/adminPermissions";
import { adminAuthErrorResponse, requireAdminPermission, supabaseAdmin } from "../../../lib/adminAuth";
import { buildAdminInviteEmailHtml } from "../../../lib/adminInviteEmailHtml";
import { resend, FROM_EMAIL } from "../../../lib/resend";
import { siteOrigin } from "../../../lib/siteOrigin";

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return error instanceof Error ? error.message : "Unexpected server error";
}

function profileDisplayName(profile: Record<string, unknown>, authUser?: { user_metadata?: Record<string, unknown> }) {
  const fromProfile = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  if (fromProfile) return fromProfile;
  const meta = authUser?.user_metadata;
  const fromMeta = [meta?.first_name, meta?.last_name].filter(Boolean).join(" ").trim();
  if (fromMeta) return fromMeta;
  if (typeof meta?.full_name === "string" && meta.full_name.trim()) return meta.full_name.trim();
  return null;
}

function buildProfileSeedFromAuthUser(authUser: {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = authUser.user_metadata || {};
  const fullName = typeof meta.full_name === "string" ? meta.full_name.trim() : "";
  const nameParts = fullName ? fullName.split(/\s+/) : [];

  return {
    id: authUser.id,
    email: authUser.email || "",
    first_name:
      (typeof meta.first_name === "string" && meta.first_name) ||
      (typeof meta.firstName === "string" && meta.firstName) ||
      nameParts[0] ||
      null,
    last_name:
      (typeof meta.last_name === "string" && meta.last_name) ||
      (typeof meta.lastName === "string" && meta.lastName) ||
      nameParts.slice(1).join(" ") ||
      null,
    phone_number:
      (typeof meta.phone === "string" && meta.phone) ||
      authUser.phone ||
      null,
    username: typeof meta.username === "string" ? meta.username : null,
  };
}

async function findAuthUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (match) return match;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

function mapTeamMember(
  profile: Record<string, unknown>,
  authUser?: { email?: string | null; created_at?: string; user_metadata?: Record<string, unknown> },
) {
  const role = typeof profile.role === "string" ? profile.role : "support";
  return {
    id: profile.id,
    email: authUser?.email || profile.email || "",
    display_name: profileDisplayName(profile, authUser),
    role,
    permissions: normalizePermissions(role, profile.admin_permissions),
    created_at: profile.created_at || authUser?.created_at,
  };
}

async function upsertAdminProfile(
  userId: string,
  fields: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    permissions: AdminPermission[];
  },
  authUser?: { email?: string | null; created_at?: string; user_metadata?: Record<string, unknown> },
) {
  const namePayload: Record<string, string | null> = {};
  if (fields.firstName) namePayload.first_name = fields.firstName;
  if (fields.lastName) namePayload.last_name = fields.lastName;

  const payload = {
    role: fields.role,
    admin_permissions: fields.permissions,
    email: fields.email,
    ...namePayload,
  };

  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile) {
    return supabaseAdmin
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select("id, role, admin_permissions, first_name, last_name, created_at, email")
      .single();
  }

  const seed = authUser
    ? buildProfileSeedFromAuthUser({ ...authUser, id: userId })
    : {
        id: userId,
        email: fields.email,
        first_name: null,
        last_name: null,
        phone_number: null,
        username: null,
      };

  return supabaseAdmin
    .from("profiles")
    .insert({
      ...seed,
      ...payload,
      first_name: fields.firstName || seed.first_name || null,
      last_name: fields.lastName || seed.last_name || null,
    })
    .select("id, role, admin_permissions, first_name, last_name, created_at, email")
    .single();
}

async function sendAdminInviteEmail(
  request: Request,
  params: { email: string; name: string; role: string },
) {
  if (!process.env.RESEND_API_KEY?.trim() || !resend) {
    throw new Error("Invitation email is not configured. Please contact support.");
  }

  const origin = siteOrigin(request);
  const redirectTo = `${origin}/reset-password?recovery=1`;

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: params.email,
    options: { redirectTo },
  });

  const actionLink = data?.properties?.action_link;
  if (error || !actionLink) {
    throw new Error(error?.message || "Could not generate invitation link.");
  }

  const { error: emailError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [params.email],
    subject: "You're invited to Sabary Tours admin",
    html: buildAdminInviteEmailHtml({
      inviteLink: actionLink,
      email: params.email,
      name: params.name,
      role: params.role,
    }),
  });

  if (emailError) {
    throw new Error("Could not send the invitation email. Please try again.");
  }
}

async function inviteNewAdminMember(
  request: Request,
  params: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: AdminPermission[];
  },
) {
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: params.email,
    email_confirm: true,
    user_metadata: {
      first_name: params.firstName,
      last_name: params.lastName,
    },
  });

  if (createError) {
    const alreadyExists = createError.message.toLowerCase().includes("already");
    if (alreadyExists) {
      const existing = await findAuthUserByEmail(params.email);
      if (!existing) throw createError;
      const { data: profile, error } = await upsertAdminProfile(
        existing.id,
        {
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          role: params.role,
          permissions: params.permissions,
        },
        existing,
      );
      if (error) throw error;
      await sendAdminInviteEmail(request, {
        email: params.email,
        name: [params.firstName, params.lastName].filter(Boolean).join(" ").trim() || params.email,
        role: params.role,
      });
      return { profile, authUser: existing, invited: true };
    }
    throw createError;
  }

  const authUser = created.user;
  const { data: profile, error } = await upsertAdminProfile(
    authUser.id,
    {
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      role: params.role,
      permissions: params.permissions,
    },
    authUser,
  );
  if (error) throw error;

  await sendAdminInviteEmail(request, {
    email: params.email,
    name: [params.firstName, params.lastName].filter(Boolean).join(" ").trim() || params.email,
    role: params.role,
  });

  return { profile, authUser, invited: true };
}

export async function GET() {
  try {
    const auth = await requireAdminPermission("settings");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, role, admin_permissions, first_name, last_name, created_at")
      .in("role", [...ADMIN_ROLE_OPTIONS]);

    if (error) throw error;

    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const members = (profiles || [])
      .filter((profile) => isAdminRole(profile.role))
      .map((profile) => {
        const authUser = users.find((user) => user.id === profile.id);
        return mapTeamMember(profile, authUser);
      })
      .sort((a, b) => new Date(String(a.created_at)).getTime() - new Date(String(b.created_at)).getTime());

    return NextResponse.json({ success: true, members });
  } catch (error: unknown) {
    console.error("Error fetching admin team:", error);
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminPermission("settings");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const role = typeof body.role === "string" ? body.role.trim().toLowerCase() : "";
    const requestedPermissions = Array.isArray(body.permissions)
      ? body.permissions.filter((item: unknown) => (
          typeof item === "string" && ADMIN_PERMISSIONS.includes(item as AdminPermission)
        ))
      : [];

    if (!email || !ADMIN_ROLE_OPTIONS.includes(role as typeof ADMIN_ROLE_OPTIONS[number])) {
      return NextResponse.json({ success: false, error: "Valid email and role are required." }, { status: 400 });
    }

    if (role === "owner" && auth.session.role !== "owner") {
      return NextResponse.json({ success: false, error: "Only an owner can assign owner access." }, { status: 403 });
    }

    const permissions = requestedPermissions.length > 0
      ? requestedPermissions
      : ADMIN_ROLE_PRESETS[role] || [];

    const authUser = await findAuthUserByEmail(email);

    if (!authUser) {
      if (!firstName) {
        return NextResponse.json(
          { success: false, error: "First name is required when inviting someone who does not have an account yet." },
          { status: 400 },
        );
      }

      const result = await inviteNewAdminMember(request, {
        email,
        firstName,
        lastName,
        role,
        permissions,
      });

      return NextResponse.json({
        success: true,
        invited: true,
        message: `Invitation sent to ${email}. They can set their password from the email link.`,
        member: mapTeamMember(result.profile, result.authUser),
      });
    }

    const { data: profile, error } = await upsertAdminProfile(
      authUser.id,
      {
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role,
        permissions,
      },
      authUser,
    );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      invited: false,
      message: `${email} now has admin access. They can log in with their existing password.`,
      member: mapTeamMember(profile, authUser),
    });
  } catch (error: unknown) {
    console.error("Error adding admin team member:", error);
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdminPermission("settings");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const body = await request.json().catch(() => ({}));
    const userId = typeof body.id === "string" ? body.id : "";
    const role = typeof body.role === "string" ? body.role.trim().toLowerCase() : "";
    const removeAccess = body.removeAccess === true;
    const requestedPermissions = Array.isArray(body.permissions)
      ? body.permissions.filter((item: unknown) => (
          typeof item === "string" && ADMIN_PERMISSIONS.includes(item as AdminPermission)
        ))
      : null;

    if (!userId) {
      return NextResponse.json({ success: false, error: "User id is required." }, { status: 400 });
    }

    const { data: target } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (!target || !isAdminRole(target.role)) {
      return NextResponse.json({ success: false, error: "Admin team member not found." }, { status: 404 });
    }

    if (userId === auth.session.userId && removeAccess) {
      return NextResponse.json({ success: false, error: "You cannot remove your own admin access." }, { status: 400 });
    }

    if (removeAccess) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ role: "subscriber", admin_permissions: [] })
        .eq("id", userId);

      if (error) throw error;
      return NextResponse.json({ success: true, removed: true });
    }

    if (role && !ADMIN_ROLE_OPTIONS.includes(role as typeof ADMIN_ROLE_OPTIONS[number])) {
      return NextResponse.json({ success: false, error: "Invalid role." }, { status: 400 });
    }

    const nextRole = role || target.role;
    if (nextRole === "owner" && auth.session.role !== "owner") {
      return NextResponse.json({ success: false, error: "Only an owner can assign owner access." }, { status: 403 });
    }

    const payload: Record<string, unknown> = {};
    if (role) payload.role = role;
    if (requestedPermissions) {
      payload.admin_permissions = requestedPermissions;
    } else if (role) {
      payload.admin_permissions = ADMIN_ROLE_PRESETS[role] || [];
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select("id, role, admin_permissions, first_name, last_name, created_at")
      .single();

    if (error) throw error;

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = users.find((user) => user.id === userId);

    return NextResponse.json({
      success: true,
      member: mapTeamMember(profile, authUser),
    });
  } catch (error: unknown) {
    console.error("Error updating admin team member:", error);
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}
