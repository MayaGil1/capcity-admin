import { requireAdmin } from "@/lib/admin";

// Explains the sign-in rule and shows whether CapCity is currently open to everyone.
export async function AccessNotice() {
  const { db } = await requireAdmin();
  const [{ count: domains }, { count: emails }] = await Promise.all([
    db.from("allowed_signup_domains").select("id", { count: "exact", head: true }),
    db.from("whitelist_email_addresses").select("id", { count: "exact", head: true }),
  ]);
  const open = !domains && !emails;

  return (
    <p className="mb-4 rounded-xl border border-black/[.07] bg-[var(--surface-1)] p-3 text-sm dark:border-white/[.08]">
      <strong>{open ? "CapCity is open to everyone right now." : "CapCity is invite-only right now."}</strong>{" "}
      <span className="text-[var(--text-secondary)]">
        When both lists are empty, anyone can sign in. As soon as either list has an entry, only matching domains and
        whitelisted emails get in ({domains ?? 0} domains, {emails ?? 0} emails). Checked at every new CapCity sign-in;
        the admin panel itself is still gated by is_superadmin.
      </span>
    </p>
  );
}
