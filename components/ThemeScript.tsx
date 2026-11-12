import { THEME_INIT } from '@/lib/theme';
import { MOTION_INIT } from '@/lib/motion/init';

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT + MOTION_INIT }} />;
}
