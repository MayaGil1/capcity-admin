# CapCity Admin

Admin panel for [CapCity](https://hello-world-iota-gilt.vercel.app), sharing its Supabase database.

- **Overview**: live statistics (votes per day, which humor style wins, engagement funnel, busiest themes, top voters, crowd favorite and most controversial captions, AI model usage)
- **Users**: read all profiles with their posts, points earned and votes cast
- **AI media**: create (upload + Gemini), read, update (theme, context, caption text/style), delete posts and captions; generate more captions
- **Votes**: read every upvote/downvote, filterable

## Security

Every route except `/login` and `/auth/*` requires a Google login (`proxy.ts`). Every page and server action
then calls `requireAdmin()` (`lib/admin.ts`), which only continues if `profiles.is_superadmin = true`;
everyone else is sent to `/denied`. Only after that check does the server use the Supabase secret key.
Users cannot grant themselves the flag: `supabase/admin.sql` limits which profile columns they can update.

## Avoiding the lock-out

The admin panel requires `is_superadmin = true`, but nobody has it at first. The Supabase SQL Editor runs
as the database owner and bypasses RLS, so the project owner sets the flag directly
(`supabase/admin.sql`, step 3). That is the only way to become an admin.

## Environment variables

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, `GEMINI_API_KEY` (see `.env.example`).

## Week 7: AI pipeline observability

CapCity's caption generator is now configured by database tables and logs every model call
(run `supabase/observability.sql` from the CapCity repo once). In the admin panel:

| Page | What you can do |
|---|---|
| Users | read profiles |
| Prompt chains | read chains and their steps (model, prompts, temperature); update the mix (captions per post from each chain) |
| Generation requests | read every caption request with status, timing and errors; open one to see all its LLM calls |
| LLM responses | read every model call: prompts sent, raw response, HTTP status, duration |
| Terms, Examples | create/read/update/delete the slang glossary and example captions injected into the prompt |
| LLM models, LLM providers | create/read/update/delete; inactive models are skipped, overloaded models fall back to other active models from the same provider |
| Signup domains, Whitelisted emails | create/read/update/delete who may sign in to CapCity (both empty = open to everyone) |
| AI media | read/view AI captions; create (upload), update and delete images |
