import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Wordmark } from "@/components/app/wordmark";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-xl items-center justify-center px-4 py-5">
          <Wordmark accent />
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-xl px-4 py-4 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          © PALADINO
        </div>
      </footer>
    </div>
  );
}