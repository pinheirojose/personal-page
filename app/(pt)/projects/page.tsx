import { pageMetadata } from '@/lib/seo';
import { HomePage } from '@/components/HomePage';

export const metadata = pageMetadata('pt', 'projects');

export default function Page() {
  return <HomePage lang="pt" page="projects" />;
}
