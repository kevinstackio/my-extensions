import { site } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="shrink-0 py-7 text-center text-xs text-muted-foreground">
      {site.copyright}
    </footer>
  );
}
