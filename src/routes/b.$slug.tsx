import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CartProvider } from "@/lib/booking/cart";
import { CartButton } from "@/components/booking/cart-button";
import { CartDrawer } from "@/components/booking/cart-drawer";

export const Route = createFileRoute("/b/$slug")({
  component: ShopLayout,
});

function ShopLayout() {
  const { slug } = Route.useParams();
  return (
    <CartProvider slug={slug}>
      <Outlet />
      <CartButton />
      <CartDrawer />
    </CartProvider>
  );
}