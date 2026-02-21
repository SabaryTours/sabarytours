import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const USERS_FILE = path.join(process.cwd(), 'migration_output', 'users.json');
const OUTPUT_FILE = path.join(process.cwd(), 'import_users.sql');

if (!fs.existsSync(USERS_FILE)) {
  console.error('users.json not found!');
  process.exit(1);
}

const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));

let sql = `-- Import Users (auth.users and public.profiles)
-- Run this in Supabase SQL Editor AFTER running migration_schema.sql

`;

let count = 0;

for (const user of users) {
  const id = randomUUID();
  const email = user.email ? user.email.replace(/'/g, "''") : null;
  const password = user.password_hash ? user.password_hash.replace(/'/g, "''") : null;

  if (!email || !password) {
    console.log(`Skipping user ${user.legacy_id} due to missing email or password`);
    continue;
  }

  // Insert into auth.users
  // Note: We use specific default values for Supabase Auth
  sql += `
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '${id}',
  'authenticated',
  'authenticated',
  '${email}',
  '${password}',
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;
`;

  // Insert into public.profiles
  const username = user.username ? user.username.replace(/'/g, "''") : '';
  const firstName = user.firstname ? user.firstname.replace(/'/g, "''") : '';
  const lastName = user.lastname ? user.lastname.replace(/'/g, "''") : '';
  const phone = user.phone ? user.phone.replace(/'/g, "''") : '';

  // We need to fetch the ID again if we skipped insertion due to conflict?
  // Actually, for migration, we assume clean slate or we can't easily link if we don't know the existing ID.
  // Using ON CONFLICT DO NOTHING for auth.users means we might skip profile insertion if we rely on the generated ID being the inserted one.
  // But for profiles, we should use the same ID.
  // If the user already exists, we probably shouldn't break.
  // We can use a CTE or just accept that if email exists, we might duplicate profile with wrong ID?
  // No, if auth.users insert is skipped, the ID is not used.
  // BUT the profile insert uses the generated 'id'.
  // If the user exists with a DIFFERENT ID, the foreign key constraint on profiles will fail (id references auth.users(id)).
  // Valid point.
  // For this migration, we assume we are populating a fresh Supabase instance or at least fresh users.
  // If we want to be safe, we could use a specific UUID generation based on email (deterministic), OR we just handle errors.

  sql += `
INSERT INTO public.profiles (
  id,
  legacy_id,
  username,
  first_name,
  last_name,
  phone_number,
  role
) VALUES (
  '${id}',
  ${user.legacy_id},
  '${username}',
  '${firstName}',
  '${lastName}',
  '${phone}',
  '${user.role || 'subscriber'}'
) ON CONFLICT (id) DO NOTHING; 
-- Note: If auth user existed with different ID, this profile insert will fail FK constraint, which is fine/safe.
`;

  count++;
}

fs.writeFileSync(OUTPUT_FILE, sql);
console.log(`Generated SQL for ${count} users.`);
