import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TenantProfile } from "@/components/marketing/tenant-profile";

export default async function TenantPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  return (
    <>
      <Header />
      <main className="flex-1">
        <TenantProfile slug={companySlug} />
      </main>
      <Footer />
    </>
  );
}
