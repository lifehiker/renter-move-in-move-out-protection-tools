import { AppHeader } from "@/components/ui-shell";
import { getPrimaryPropertyForUser } from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCurrentUser();
  const property = await getPrimaryPropertyForUser(user.id);

  return (
    <>
      <AppHeader propertyId={property?.id} userName={user.name} />
      <main className="page-shell">{children}</main>
    </>
  );
}
