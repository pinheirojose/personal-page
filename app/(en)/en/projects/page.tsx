import { pageMetadata } from '@/lib/seo';
import { HomePage } from '@/components/HomePage';

export const metadata = pageMetadata('en', 'projects');

export default function Page() {
  return <HomePage lang="en" page="projects" />;
}
