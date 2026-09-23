-- ============================================================================
-- seed.sql — initial roles, permission catalog, and role->permission grants
-- for Bhoirwadi Sanskritik Association v0.0.1.
--
-- Idempotent: safe to re-run (every insert uses ON CONFLICT DO NOTHING).
-- Domain permissions (gallery.*, video.*, ...) are seeded now even though
-- the domain tables/features don't exist yet, so the RBAC architecture is
-- exercised end-to-end from day one (app.md #13: "the architecture matters
-- more than defining every future permission").
-- ============================================================================

insert into public.roles (key, name, description) values
  ('member', 'Member', 'A signed-in community member.'),
  ('moderator', 'Moderator', 'Reviews and moderates community-submitted content.'),
  ('content_manager', 'Content Manager', 'Manages gallery and published content.'),
  ('event_manager', 'Event Manager', 'Creates and publishes events.'),
  ('finance_manager', 'Finance Manager', 'Views and manages payment/donation records.'),
  ('admin', 'Administrator', 'Broad operational access; cannot grant super_admin or change system settings.'),
  ('super_admin', 'Super Administrator', 'Full platform authority, including system configuration and role escalation.')
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('gallery.read', 'View gallery albums and photos.'),
  ('gallery.create', 'Create gallery albums/photos.'),
  ('gallery.update', 'Edit gallery albums/photos.'),
  ('gallery.delete', 'Delete gallery albums/photos.'),
  ('video.read', 'View published videos.'),
  ('video.upload', 'Upload a video for review.'),
  ('video.update_own', 'Edit one''s own uploaded video metadata.'),
  ('video.delete_own', 'Delete one''s own uploaded video.'),
  ('video.moderate', 'Approve or reject uploaded videos.'),
  ('review.read', 'View published reviews.'),
  ('review.create', 'Submit a review.'),
  ('review.update_own', 'Edit one''s own review.'),
  ('review.delete_own', 'Delete one''s own review.'),
  ('review.moderate', 'Approve, reject, or hide reviews.'),
  ('event.read', 'View published events.'),
  ('event.create', 'Draft new events.'),
  ('event.update', 'Edit events.'),
  ('event.publish', 'Publish/unpublish events.'),
  ('event.delete', 'Delete events.'),
  ('livestream.read', 'View public livestreams.'),
  ('livestream.create', 'Schedule a livestream.'),
  ('livestream.broadcast', 'Obtain a broadcaster token for a livestream.'),
  ('livestream.end', 'End an active livestream.'),
  ('livestream.manage', 'Manage livestream configuration.'),
  ('payment.create', 'Initiate a payment/donation.'),
  ('payment.read_own', 'View one''s own payment history.'),
  ('payment.read_all', 'View all payment/donation records.'),
  ('payment.refund', 'Issue refunds.'),
  ('user.read', 'View other users'' profile data.'),
  ('user.manage', 'Edit or deactivate other users'' accounts.'),
  ('role.assign', 'Grant or revoke roles (super_admin requires system.manage too).'),
  ('audit.read', 'Read the audit log.'),
  ('system.manage', 'Change system-level configuration and settings.')
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- Role -> permission grants
-- ----------------------------------------------------------------------------

with grants (role_key, permission_key) as (
  values
    -- member
    ('member', 'gallery.read'),
    ('member', 'video.read'),
    ('member', 'video.upload'),
    ('member', 'video.update_own'),
    ('member', 'video.delete_own'),
    ('member', 'review.read'),
    ('member', 'review.create'),
    ('member', 'review.update_own'),
    ('member', 'review.delete_own'),
    ('member', 'event.read'),
    ('member', 'livestream.read'),
    ('member', 'payment.create'),
    ('member', 'payment.read_own'),

    -- moderator
    ('moderator', 'gallery.read'),
    ('moderator', 'video.read'),
    ('moderator', 'video.moderate'),
    ('moderator', 'review.read'),
    ('moderator', 'review.moderate'),
    ('moderator', 'event.read'),
    ('moderator', 'livestream.read'),

    -- content_manager
    ('content_manager', 'gallery.read'),
    ('content_manager', 'gallery.create'),
    ('content_manager', 'gallery.update'),
    ('content_manager', 'gallery.delete'),
    ('content_manager', 'video.read'),
    ('content_manager', 'video.moderate'),
    ('content_manager', 'event.read'),

    -- event_manager
    ('event_manager', 'event.read'),
    ('event_manager', 'event.create'),
    ('event_manager', 'event.update'),
    ('event_manager', 'event.publish'),
    ('event_manager', 'event.delete'),
    ('event_manager', 'livestream.read'),
    ('event_manager', 'livestream.create'),
    ('event_manager', 'livestream.manage'),

    -- finance_manager
    ('finance_manager', 'payment.read_own'),
    ('finance_manager', 'payment.read_all'),
    ('finance_manager', 'payment.refund'),

    -- admin (broad, but NOT system.manage — see user_roles RLS policy)
    ('admin', 'gallery.read'), ('admin', 'gallery.create'), ('admin', 'gallery.update'), ('admin', 'gallery.delete'),
    ('admin', 'video.read'), ('admin', 'video.moderate'),
    ('admin', 'review.read'), ('admin', 'review.moderate'),
    ('admin', 'event.read'), ('admin', 'event.create'), ('admin', 'event.update'), ('admin', 'event.publish'), ('admin', 'event.delete'),
    ('admin', 'livestream.read'), ('admin', 'livestream.manage'),
    ('admin', 'payment.read_all'),
    ('admin', 'user.read'), ('admin', 'user.manage'),
    ('admin', 'role.assign'),
    ('admin', 'audit.read'),

    -- super_admin: every permission
    ('super_admin', 'gallery.read'), ('super_admin', 'gallery.create'), ('super_admin', 'gallery.update'), ('super_admin', 'gallery.delete'),
    ('super_admin', 'video.read'), ('super_admin', 'video.upload'), ('super_admin', 'video.update_own'), ('super_admin', 'video.delete_own'), ('super_admin', 'video.moderate'),
    ('super_admin', 'review.read'), ('super_admin', 'review.create'), ('super_admin', 'review.update_own'), ('super_admin', 'review.delete_own'), ('super_admin', 'review.moderate'),
    ('super_admin', 'event.read'), ('super_admin', 'event.create'), ('super_admin', 'event.update'), ('super_admin', 'event.publish'), ('super_admin', 'event.delete'),
    ('super_admin', 'livestream.read'), ('super_admin', 'livestream.create'), ('super_admin', 'livestream.broadcast'), ('super_admin', 'livestream.end'), ('super_admin', 'livestream.manage'),
    ('super_admin', 'payment.create'), ('super_admin', 'payment.read_own'), ('super_admin', 'payment.read_all'), ('super_admin', 'payment.refund'),
    ('super_admin', 'user.read'), ('super_admin', 'user.manage'),
    ('super_admin', 'role.assign'), ('super_admin', 'audit.read'), ('super_admin', 'system.manage')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from grants g
join public.roles r on r.key = g.role_key
join public.permissions p on p.key = g.permission_key
on conflict (role_id, permission_id) do nothing;

-- ----------------------------------------------------------------------------
-- Initial app_versions row so GET /api/v1/system/version has data to read.
-- ----------------------------------------------------------------------------

insert into public.app_versions (version, build_id, minimum_supported_version, update_type, release_notes)
values ('0.0.1', 'seed', '0.0.1', 'none', 'Foundation release.')
on conflict do nothing;
