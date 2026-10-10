import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { PlatformDownloads } from '@/features/download/platform-downloads';
import { site } from '@/config/site';

export function HomePage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6 sm:px-10 lg:px-12">
      <SiteHeader />
      <main className="grid flex-1 content-center items-center gap-12 pt-8 pb-12 sm:grid-cols-[1.2fr_1fr] sm:gap-8 sm:pt-14 sm:pb-20">
        <div>
          <h1 className="text-[clamp(1.8rem,4.2vw,2.625rem)] leading-[1.38] font-semibold tracking-[-0.04em]">
            {site.headline.map((line) => <span key={line} className="block">{line}</span>)}
          </h1>
          <PlatformDownloads />
        </div>
        <div className="flex items-center justify-center sm:pb-12">
          <img src="/exts.svg" alt="Exts" width="220" height="220" className="size-40 sm:size-[220px]" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
