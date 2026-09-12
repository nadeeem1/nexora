import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <Card className="mt-6">
      <EmptyState
        icon={<Compass className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden />}
        title="404 — Page not found"
        description="The page you are looking for doesn’t exist or has moved."
        action={
          <Link to="/">
            <Button>Back to dashboard</Button>
          </Link>
        }
      />
    </Card>
  );
}