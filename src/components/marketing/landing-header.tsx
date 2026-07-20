import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/app/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/modulos" className="text-sm text-muted-foreground hover:text-foreground">
            Módulos
          </Link>
          <Link to="/montar" className="text-sm text-muted-foreground hover:text-foreground">
            Monte seu Paladino
          </Link>
          <Link to="/precos" className="text-sm text-muted-foreground hover:text-foreground">
            Preços
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            to="/montar"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 sm:px-4"
          >
            Testar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}