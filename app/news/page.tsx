import { AppShell } from "@/components/AppShell";
import { NewsFeed } from "@/components/NewsFeed";

export default function AllNewsPage() {
  return (
    <AppShell>
      <div className="animate-in fade-in duration-300 ease-cg pb-16">
        <div className="mb-8">
          <p className="cg-eyebrow">Company news</p>
          <h1 className="mt-2 text-4xl">News &amp; updates</h1>
          <p className="mt-2 text-base">
            Everything the communications team has shared with the group.
          </p>
        </div>

        {/* No limit here: this is the full archive. */}
        <NewsFeed limit={0} />
      </div>
    </AppShell>
  );
}
