-- Enable RLS on storage.objects (if not already enabled)
alter table storage.objects enable row level security;

-- Create policy to allow public read access to files in the 'attachments' bucket
create policy "Public Read Access"
on storage.objects for select
using ( bucket_id = 'attachments' );

-- Create policy to allow uploads (inserts) to the 'attachments' bucket
-- Note: In a production app, you might want to restrict this to authenticated users
create policy "Allow Uploads"
on storage.objects for insert
with check ( bucket_id = 'attachments' );

-- Create policy to allow updates (e.g. renaming/moving)
create policy "Allow Updates"
on storage.objects for update
using ( bucket_id = 'attachments' );

-- Create policy to allow deletions
create policy "Allow Deletion"
on storage.objects for delete
using ( bucket_id = 'attachments' );
