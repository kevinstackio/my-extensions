import { Button } from '@/components/ui/button';
import { site } from '@/config/site';
import chromeIcon from '@/assets/googlechrome.svg';
import appleIcon from '@/assets/apple.svg';

export function PlatformDownloads() {
  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-11 min-w-32 gap-4 rounded-lg px-5">
          <a href={site.macDownloadUrl} aria-label="下载 macOS 应用">
            macOS
            <img src={appleIcon} alt="" aria-hidden="true" className="size-[18px] brightness-0 invert" />
          </a>
        </Button>
        <Button asChild size="lg" className="h-11 min-w-32 gap-4 rounded-lg px-5">
          <a href={site.chromeDownloadUrl} aria-label="下载 Chrome 扩展">
            Chrome
            <img src={chromeIcon} alt="" aria-hidden="true" className="size-[18px] brightness-0 invert" />
          </a>
        </Button>
      </div>
    </div>
  );
}
