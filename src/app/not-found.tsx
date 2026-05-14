import { LayoutShell } from '@/components/layout/shell';
import { Card } from '@/components/ui/card';

export default function NotFoundPage() {
  return (
    <LayoutShell title="Not Found">
      <Card title="404" icon={<span className="text-2xl">🚀</span>}>
        <p className="text-sm text-neutral-400 dark:text-neutral-500">The page you are looking for does not exist.</p>
      </Card>
    </LayoutShell>
  );
}