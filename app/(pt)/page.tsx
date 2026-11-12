import { pageMetadata } from '@/lib/seo';
import { HomePage } from '@/components/HomePage';

export const metadata = pageMetadata('pt', 'home');

export default function Page() {
  return <HomePage lang="pt" page="home" />;
}
