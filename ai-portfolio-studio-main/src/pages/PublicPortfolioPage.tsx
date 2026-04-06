import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioContent, defaultPortfolioContent } from '@/types/portfolio';
import PortfolioPreview from '@/components/portfolio/PortfolioPreview';
import { Loader2 } from 'lucide-react';

export default function PublicPortfolioPage() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('content')
        .eq('public_url_slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        const c = data.content as Record<string, unknown> | null;
        setContent(c ? { ...defaultPortfolioContent, ...c } as PortfolioContent : defaultPortfolioContent);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-2">
        <p className="text-lg font-semibold">Portfolio not found</p>
        <p className="text-sm text-muted-foreground">This portfolio may be unpublished or doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl py-12 px-4">
        <PortfolioPreview content={content} />
      </div>
    </div>
  );
}
