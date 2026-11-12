import { pageMetadata } from '@/lib/seo';
import { HomePage } from '@/components/HomePage';

export const metadata = pageMetadata('en', 'home');

export default function Page() {
  return <HomePage lang="en" page="home" />;
}
