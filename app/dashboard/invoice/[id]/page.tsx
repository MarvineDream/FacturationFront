// app/dashboard/invoice/[id]/page.tsx
import { ProtectedRoute } from "@/components/protected-route";
import { InvoiceDetail } from "@/components/user/invoice-detail";

// --- Server Component Async
export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; 
  const invoiceId = resolvedParams.id;

  if (!invoiceId) return <div>Facture introuvable</div>;

  return (
    <ProtectedRoute>
      <InvoiceDetail invoiceId={invoiceId} />
    </ProtectedRoute>
  );
}
