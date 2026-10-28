import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { themeForDate } from "@/lib/themes";
import NewPostForm from "./NewPostForm";

// Caption generation runs inside this page's server action; give slow AI calls room to retry.
export const maxDuration = 300;

export default async function NewPostPage() {
  const { user } = await requireAdmin();
  return (
    <>
      <Link href="/posts" className="text-sm text-[var(--text-secondary)] hover:underline">← AI media</Link>
      <div className="mt-2" />
      <PageHeader title="New AI post" description="Upload a photo; Gemini writes five captions that appear in the CapCity feed." />
      <NewPostForm userId={user.id} defaultTheme={themeForDate()} />
    </>
  );
}
