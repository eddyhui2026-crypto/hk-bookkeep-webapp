-- Optional slug for seeded categories: UI can translate labels by locale while keeping stored `name` for exports.
alter table public.categories add column if not exists slug text;
