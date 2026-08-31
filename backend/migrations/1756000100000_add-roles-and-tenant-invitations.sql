-- Up Migration
-- Brings the live schema up to date with db/schema.sql's role/permission model,
-- decided 2026-08-28 (see schema.sql fix log items 7-11) but never actually applied.

-- 1. Rename cohorts -> batches (tenants.type now uses the word "cohort" for the
--    organization-level tenant itself; a batch is a sub-group inside one).
ALTER TABLE cohorts RENAME TO batches;
ALTER TABLE batches RENAME CONSTRAINT cohorts_pkey TO batches_pkey;
ALTER TABLE batches RENAME CONSTRAINT cohorts_tenant_id_fkey TO batches_tenant_id_fkey;
ALTER INDEX idx_cohorts_tenant_id RENAME TO idx_batches_tenant_id;
ALTER TABLE batches ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. tenants: new type values, category, managed_by, deactivated_at.
UPDATE tenants SET type = 'individual_free' WHERE type = 'default';
UPDATE tenants SET type = 'cohort' WHERE type = 'company';
ALTER TABLE tenants ALTER COLUMN type SET DEFAULT 'individual_free';
ALTER TABLE tenants DROP CONSTRAINT tenants_type_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_type_check
    CHECK (type IN ('individual_free', 'individual_paid', 'cohort'));
ALTER TABLE tenants ADD COLUMN category TEXT
    CHECK (category IN ('company', 'university', 'other'));
ALTER TABLE tenants ADD COLUMN managed_by UUID;
ALTER TABLE tenants ADD COLUMN deactivated_at TIMESTAMPTZ;

-- 3. users: role, department, permissions, batch_id; tenant_id becomes optional
--    (admin/super_admin work for the platform, not a customer's org).
ALTER TABLE users ADD COLUMN batch_id UUID REFERENCES batches(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'learner';
ALTER TABLE users ADD COLUMN department TEXT;
ALTER TABLE users ADD COLUMN permissions JSONB;
ALTER TABLE users ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('learner', 'org_admin', 'admin', 'super_admin'));
ALTER TABLE users ADD CONSTRAINT tenant_required_by_role CHECK (
    (role IN ('learner', 'org_admin') AND tenant_id IS NOT NULL) OR (role IN ('admin', 'super_admin'))
);

-- 4. Deferred FK: tenants.managed_by -> users, now that users has the shape it needs.
ALTER TABLE tenants ADD CONSTRAINT fk_tenants_managed_by
    FOREIGN KEY (managed_by) REFERENCES users(id) ON DELETE SET NULL;

-- 5. Indexes.
CREATE INDEX idx_tenants_managed_by ON tenants(managed_by);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_batch_id ON users(batch_id);

-- 6. tenant_invitations — one reusable invitation link per organization.
CREATE TABLE tenant_invitations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at  TIMESTAMPTZ,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tenant_invitations_tenant_id ON tenant_invitations(tenant_id);

-- Down Migration
DROP TABLE IF EXISTS tenant_invitations;

DROP INDEX IF EXISTS idx_users_batch_id;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_tenants_managed_by;

ALTER TABLE tenants DROP CONSTRAINT IF EXISTS fk_tenants_managed_by;

ALTER TABLE users DROP CONSTRAINT IF EXISTS tenant_required_by_role;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE users DROP COLUMN IF EXISTS permissions;
ALTER TABLE users DROP COLUMN IF EXISTS department;
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users DROP COLUMN IF EXISTS batch_id;

ALTER TABLE tenants DROP COLUMN IF EXISTS deactivated_at;
ALTER TABLE tenants DROP COLUMN IF EXISTS managed_by;
ALTER TABLE tenants DROP COLUMN IF EXISTS category;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_type_check;
UPDATE tenants SET type = 'company' WHERE type = 'cohort';
UPDATE tenants SET type = 'default' WHERE type = 'individual_free' OR type = 'individual_paid';
ALTER TABLE tenants ALTER COLUMN type SET DEFAULT 'default';
ALTER TABLE tenants ADD CONSTRAINT tenants_type_check CHECK (type IN ('default', 'company'));

ALTER TABLE batches DROP COLUMN IF EXISTS created_by;
ALTER INDEX IF EXISTS idx_batches_tenant_id RENAME TO idx_cohorts_tenant_id;
ALTER TABLE batches RENAME CONSTRAINT batches_tenant_id_fkey TO cohorts_tenant_id_fkey;
ALTER TABLE batches RENAME CONSTRAINT batches_pkey TO cohorts_pkey;
ALTER TABLE batches RENAME TO cohorts;
