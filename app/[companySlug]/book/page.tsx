import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookingFlow } from "@/components/booking/booking-flow";

export default async function BookPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  return (
    <>
      <Header />
      <main className="flex-1 bg-canvas">
        <BookingFlow slug={companySlug} />
      </main>
      <Footer />
    </>
  );
}
