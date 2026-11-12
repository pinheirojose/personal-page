import { THEME_INIT } from '@/lib/theme';

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
