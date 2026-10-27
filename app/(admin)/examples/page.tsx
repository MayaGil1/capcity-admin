import ResourcePage from "@/components/ResourcePage";

export default async function ExamplesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <ResourcePage
      resource="examples"
      title="AI generation examples"
      description="Example captions shown to the AI. The top 5 by priority go into every caption prompt"
      q={q}
    />
  );
}
