import ResourcePage from "@/components/ResourcePage";

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <ResourcePage
      resource="terms"
      title="Terms"
      description="Campus and city slang. The 15 highest-priority terms are added to every caption prompt"
      q={q}
    />
  );
}
