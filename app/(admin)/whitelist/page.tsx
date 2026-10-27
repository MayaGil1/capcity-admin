import { AccessNotice } from "@/components/AccessNotice";
import ResourcePage from "@/components/ResourcePage";

export default async function WhitelistPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <ResourcePage
      resource="whitelist"
      title="Whitelisted emails"
      description="Individual emails that can sign in to CapCity even if their domain isn't allowed"
      q={q}
      notice={<AccessNotice />}
    />
  );
}
