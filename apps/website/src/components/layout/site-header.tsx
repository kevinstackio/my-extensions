import { site } from '@/config/site';
import { Button } from '@/components/ui/button';
import githubIcon from '@/assets/github.svg';

export function SiteHeader() {
  return (
    <header className="flex h-24 shrink-0 items-center justify-between">
      <span className="text-[26px] font-semibold tracking-[-1.1px]">{site.name}</span>
      <Button asChild variant="ghost" size="icon" className="size-10">
        <a href={site.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="在 GitHub 查看 Exts 源码">
          <img src={githubIcon} alt="" aria-hidden="true" className="size-[21px]" />
        </a>
      </Button>
    </header>
  );
}
