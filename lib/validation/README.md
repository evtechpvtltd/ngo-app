# lib/validation/

Reserved for shared Zod schemas used across multiple features (e.g. a
common pagination-params schema, a common address/contact schema). v0.0.1's
schemas are colocated with their owning module instead
(`lib/config/env.*.ts`, `lib/offline/schemas.ts`,
`service-worker/messages/types.ts`) since nothing is shared across features
yet.
