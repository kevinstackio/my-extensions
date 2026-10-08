const iconSizes = [16, 32, 48, 128] as const;

export type IconTheme = 'dark' | 'light';

export interface ThemeMessage {
  type: 'x-download-theme';
  theme: IconTheme;
}

export interface ColorSchemeSource {
  matches: boolean;
  addEventListener(type: 'change', listener: () => void): void;
}

function createIconPaths(theme: IconTheme): Record<(typeof iconSizes)[number], string> {
  const variant = theme === 'light' ? '-light' : '';

  return Object.fromEntries(
    iconSizes.map(size => [
      size,
      `/icon/x-download${variant}-${size}.png`,
    ]),
  ) as Record<(typeof iconSizes)[number], string>;
}

export const actionIconPaths = {
  dark: createIconPaths('dark'),
  light: createIconPaths('light'),
} satisfies Record<IconTheme, Record<(typeof iconSizes)[number], string>>;

export function createThemeMessage(systemPrefersDark: boolean): ThemeMessage {
  return {
    type: 'x-download-theme',
    theme: systemPrefersDark ? 'light' : 'dark',
  };
}

export function watchSystemTheme(
  colorScheme: ColorSchemeSource,
  send: (message: ThemeMessage) => void,
): void {
  const sendTheme = () => send(createThemeMessage(colorScheme.matches));

  sendTheme();
  colorScheme.addEventListener('change', sendTheme);
}

export function handleThemeMessage(
  message: unknown,
  setIcon: (options: { path: Record<number, string> }) => unknown,
): unknown {
  if (!isThemeMessage(message)) return undefined;

  return setIcon({ path: actionIconPaths[message.theme] });
}

export function isThemeMessage(message: unknown): message is ThemeMessage {
  if (!message || typeof message !== 'object') return false;

  const candidate = message as Partial<ThemeMessage>;
  return candidate.type === 'x-download-theme'
    && (candidate.theme === 'dark' || candidate.theme === 'light');
}
