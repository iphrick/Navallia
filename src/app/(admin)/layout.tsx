import { RouteGuard } from "@/components/shared/RouteGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <AdminLayout>{children}</AdminLayout>
    </RouteGuard>
  );
}
