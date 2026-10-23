import Link from "next/link";
import { BarList, Card, ColumnChart, DivergingBars, StatTile } from "@/components/charts";
import { displayName, requireAdmin } from "@/lib/admin";
import { loadAll, nyDay } from "@/lib/data";

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default async function OverviewPage() {
  const { db } = await requireAdmin();
  const { profiles, posts, captions, votes } = await loadAll(db);

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const postById = new Map(posts.map((p) => [p.id, p]));
  const upvotes = votes.filter((v) => v.value === 1).length;

  // Engagement funnel: how far do people get?
  const completed = profiles.filter((p) => p.first_name && p.last_name).length;
  const posters = new Set(posts.map((p) => p.user_id)).size;
  const voters = new Set(votes.map((v) => v.user_id)).size;

  // Votes per day, last 14 days (New York time).
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86_400_000);
    return nyDay(d);
  });
  const votesPerDay = days.map((day) => {
    const [, m, d] = day.split("-").map(Number);
    return {
      label: new Date(Date.UTC(2000, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      shortLabel: String(d),
      value: votes.filter((v) => nyDay(v.created_at) === day).length,
    };
  });

  // Which caption style does the crowd actually like?
  const styles = new Map<string, { n: number; score: number; up: number; down: number }>();
  for (const c of captions) {
    const s = styles.get(c.style) ?? { n: 0, score: 0, up: 0, down: 0 };
    s.n += 1;
    s.score += c.score;
    s.up += c.upvotes;
    s.down += c.downvotes;
    styles.set(c.style, s);
  }
  const styleRows = [...styles.entries()]
    .map(([style, s]) => ({
      label: style,
      value: s.score / s.n,
      detail: `${s.n} captions · ${s.up}▲ ${s.down}▼ · ${s.up + s.down ? pct(s.up / (s.up + s.down)) : "–"} upvoted`,
    }))
    .sort((a, b) => b.value - a.value);

  // Themes: which daily prompts get people posting and voting?
  const themes = new Map<string, { posts: number; score: number }>();
  for (const p of posts) {
    const t = themes.get(p.theme) ?? { posts: 0, score: 0 };
    t.posts += 1;
    t.score += p.score;
    themes.set(p.theme, t);
  }
  const themeRows = [...themes.entries()]
    .map(([theme, t]) => ({ label: theme, value: t.posts, detail: `${t.posts} posts · ${t.score} net points` }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Most active voters.
  const voteCounts = new Map<string, number>();
  for (const v of votes) voteCounts.set(v.user_id, (voteCounts.get(v.user_id) ?? 0) + 1);
  const topVoters = [...voteCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, n]) => {
      const p = profileById.get(id);
      return { label: p ? displayName(p) : "Deleted user", value: n };
    });

  // Standout captions.
  const favorite = [...captions].sort((a, b) => b.score - a.score || b.upvotes - a.upvotes)[0];
  const controversial = [...captions]
    .filter((c) => c.upvotes > 0 && c.downvotes > 0)
    .sort((a, b) => Math.min(b.upvotes, b.downvotes) - Math.min(a.upvotes, a.downvotes) || (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes))[0];

  const models = new Map<string, number>();
  for (const c of captions) models.set(c.model, (models.get(c.model) ?? 0) + 1);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-[var(--text-secondary)]">What&apos;s happening on CapCity right now.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Users" value={profiles.length} detail={`${voters} have voted`} />
        <StatTile label="Photos posted" value={posts.length} detail={`by ${posters} ${posters === 1 ? "person" : "people"}`} />
        <StatTile label="AI captions" value={captions.length} detail={`${posts.length ? (captions.length / posts.length).toFixed(1) : 0} per photo`} />
        <StatTile label="Votes cast" value={votes.length} detail={`${votes.length ? (votes.length / Math.max(1, voters)).toFixed(1) : 0} per voter`} />
        <StatTile label="Upvote rate" value={votes.length ? pct(upvotes / votes.length) : "–"} detail={`${upvotes}▲ · ${votes.length - upvotes}▼`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Votes per day" subtitle="Last 14 days, New York time">
          <ColumnChart data={votesPerDay} unit="votes" />
        </Card>
        <Card title="Which humor style wins?" subtitle="Average net score per caption (upvotes − downvotes). Hover for details.">
          {styleRows.length ? <DivergingBars rows={styleRows} /> : <Empty />}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Engagement funnel" subtitle="How far users get">
          <BarList
            rows={[
              { label: "Signed in", value: profiles.length },
              { label: "Completed profile", value: completed },
              { label: "Voted at least once", value: voters },
              { label: "Posted a photo", value: posters },
            ]}
            format={(v) => `${v} · ${profiles.length ? pct(v / profiles.length) : "–"}`}
          />
        </Card>
        <Card title="Busiest daily themes" subtitle="Photos posted per theme">
          {themeRows.length ? <BarList rows={themeRows} /> : <Empty />}
        </Card>
        <Card title="Most active voters" subtitle="Votes cast">
          {topVoters.length ? <BarList rows={topVoters} /> : <Empty />}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CaptionHighlight title="🏆 Crowd favorite" caption={favorite} imageUrl={favorite && postById.get(favorite.post_id)?.image_url} />
        <CaptionHighlight
          title="🌶️ Most controversial"
          caption={controversial}
          imageUrl={controversial && postById.get(controversial.post_id)?.image_url}
          empty="No caption has both upvotes and downvotes yet."
        />
        <Card title="AI models used" subtitle="Captions generated per model">
          <BarList rows={[...models.entries()].map(([label, value]) => ({ label, value }))} />
        </Card>
      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-[var(--text-secondary)]">No data yet.</p>;
}

function CaptionHighlight({
  title,
  caption,
  imageUrl,
  empty = "No captions yet.",
}: {
  title: string;
  caption?: { id: number; post_id: number; text: string; style: string; upvotes: number; downvotes: number; score: number };
  imageUrl?: string;
  empty?: string;
}) {
  return (
    <Card title={title}>
      {caption ? (
        <Link href={`/posts/${caption.post_id}`} className="flex gap-3 hover:opacity-80">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <p className="text-sm leading-snug">“{caption.text}”</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {caption.style} · {caption.upvotes}▲ {caption.downvotes}▼ · net {caption.score}
            </p>
          </div>
        </Link>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">{empty}</p>
      )}
    </Card>
  );
}
