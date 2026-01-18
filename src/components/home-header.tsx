
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Leaf, History } from 'lucide-react';

interface HomeHeaderProps {
  onHistoryClick: () => void;
}

export default function HomeHeader({ onHistoryClick }: HomeHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null to prevent hydration mismatch
    // A placeholder of the same height can prevent layout shift
    return <header className="flex items-center justify-between gap-3 mb-8 h-[60px]" />;
  }

  return (
    <header className="flex items-center justify-between gap-3 mb-8">
      <div className="flex items-center gap-3">
        <Leaf className="w-10 h-10 text-primary animate-pulse" />
        <h1 className="text-3xl sm:text-4xl font-bold text-primary font-headline">
          LeafWise
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onHistoryClick}>
          <History className="h-5 w-5" />
          <span className="sr-only">View History</span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
