import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PortfolioContent, defaultPortfolioContent } from '@/types/portfolio';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export function usePortfolio() {
  const { user } = useAuth();
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [content, setContent] = useState<PortfolioContent>(defaultPortfolioContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load or create portfolio
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading portfolio:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setPortfolioId(data.id);
        const c = data.content as Record<string, unknown> | null;
        if (c && typeof c === 'object') {
          setContent({ ...defaultPortfolioContent, ...c } as PortfolioContent);
        }
      } else {
        // Create a new portfolio
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert({ user_id: user.id, name: 'My Portfolio' })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating portfolio:', createError);
        } else if (newPortfolio) {
          setPortfolioId(newPortfolio.id);
        }
      }
      setLoading(false);
    };

    load();
  }, [user]);

  // Auto-save with debounce
  const save = useCallback(
    async (newContent: PortfolioContent) => {
      if (!portfolioId) return;
      setSaving(true);
      const { error } = await supabase
        .from('portfolios')
        .update({ content: newContent as unknown as Json })
        .eq('id', portfolioId);

      if (error) {
        console.error('Save error:', error);
        toast.error('Failed to save');
      }
      setSaving(false);
    },
    [portfolioId]
  );

  const updateContent = useCallback(
    (partial: Partial<PortfolioContent>) => {
      setContent((prev) => {
        const updated = { ...prev, ...partial };
        // Debounced auto-save
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => save(updated), 1200);
        return updated;
      });
    },
    [save]
  );

  return { content, updateContent, loading, saving, portfolioId };
}
