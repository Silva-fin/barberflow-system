import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/booking/cart";

export function CartButton() {
  const { cart, openDrawer } = useCart();
  const count = cart.items.reduce((acc, i) => acc + i.qty, 0);
  if (count === 0) return null;
  return (
    <Button
      onClick={openDrawer}
      size="lg"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full p-0 shadow-lg"
      aria-label={`Carrinho com ${count} ${count === 1 ? "item" : "itens"}`}
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
        {count}
      </span>
    </Button>
  );
}