import Avatar from "@/components/Avatar";
import { PageHeader, SearchForm, TableWrap, td, th } from "@/components/ui";
import { displayName, requireAdmin } from "@/lib/admin";
import { formatDate, loadAll } from "@/lib/data";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { db } = await requireAdmin();
  const { q } = await searchParams;
  const { profiles, posts, votes } = await loadAll(db);

  const postCount = new Map<string, number>();
  const pointsEarned = new Map<string, number>();
  for (const p of posts) {
    postCount.set(p.user_id, (postCount.get(p.user_id) ?? 0) + 1);
    pointsEarned.set(p.user_id, (pointsEarned.get(p.user_id) ?? 0) + p.score);
  }
  const voteCount = new Map<string, number>();
  for (const v of votes) voteCount.set(v.user_id, (voteCount.get(v.user_id) ?? 0) + 1);

  const needle = q?.trim().toLowerCase();
  const rows = profiles
    .filter((p) => !needle || `${displayName(p)} ${p.email}`.toLowerCase().includes(needle))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <>
      <PageHeader
        title="Users"
        description={`${profiles.length} profiles · read-only`}
        action={<SearchForm q={q} placeholder="Search name or email" />}
      />
      <TableWrap>
        <thead>
          <tr>
            <th className={th}>User</th>
            <th className={th}>Email</th>
            <th className={`${th} text-right`}>Posts</th>
            <th className={`${th} text-right`}>Points earned</th>
            <th className={`${th} text-right`}>Votes cast</th>
            <th className={th}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const name = displayName(p);
            return (
              <tr key={p.id}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <Avatar url={p.avatar_url} name={name} size={32} />
                    <div>
                      <p className="font-medium">{p.first_name ? name : <span className="text-[var(--text-secondary)] italic">No name yet</span>}</p>
                      {p.is_superadmin && (
                        <span className="text-[10px] font-semibold tracking-wide text-[var(--series-1)] uppercase">Admin</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className={`${td} text-[var(--text-secondary)]`}>{p.email}</td>
                <td className={`${td} text-right tabular-nums`}>{postCount.get(p.id) ?? 0}</td>
                <td className={`${td} text-right tabular-nums`}>{pointsEarned.get(p.id) ?? 0}</td>
                <td className={`${td} text-right tabular-nums`}>{voteCount.get(p.id) ?? 0}</td>
                <td className={`${td} whitespace-nowrap text-[var(--text-secondary)]`}>{formatDate(p.created_at)}</td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className={`${td} text-center text-[var(--text-secondary)]`}>
                No users match “{q}”.
              </td>
            </tr>
          )}
        </tbody>
      </TableWrap>
    </>
  );
}
