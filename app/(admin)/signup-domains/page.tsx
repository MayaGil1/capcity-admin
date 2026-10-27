import { AccessNotice } from "@/components/AccessNotice";
import ResourcePage from "@/components/ResourcePage";

export default async function SignupDomainsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <ResourcePage
      resource="signup-domains"
      title="Allowed signup domains"
      description="Anyone with an email on these domains (or their subdomains) can sign in to CapCity"
      q={q}
      notice={<AccessNotice />}
    />
  );
}
