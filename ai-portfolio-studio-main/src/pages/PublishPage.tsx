import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Globe, Link as LinkIcon, Copy, ExternalLink, Eye, Loader2, CheckCircle2, AlertCircle, Share2,
} from 'lucide-react';

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

export default function PublishPage() {
  const { user } = useAuth();
  const { portfolioId, content, loading: portfolioLoading } = usePortfolio();
  const [published, setPublished] = useState(false);
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const baseUrl = window.location.origin;
  const publicUrl = slug ? `${baseUrl}/p/${slug}` : '';

  // Load current publish state
  useEffect(() => {
    if (!portfolioId) return;
    const load = async () => {
      const { data } = await supabase
        .from('portfolios')
        .select('published, public_url_slug')
        .eq('id', portfolioId)
        .single();
      if (data) {
        setPublished(data.published);
        setSlug(data.public_url_slug || '');
      }
      setLoading(false);
    };
    load();
  }, [portfolioId]);

  const generateSlug = () => {
    const name = content.fullName || user?.user_metadata?.full_name || 'portfolio';
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const random = Math.random().toString(36).substring(2, 6);
    setSlug(`${base}-${random}`);
  };

  const handleSave = async () => {
    if (!portfolioId) return;
    if (published && !slug.trim()) {
      toast.error('Please set a URL slug before publishing');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('portfolios')
      .update({
        published,
        public_url_slug: slug.trim() || null,
      })
      .eq('id', portfolioId);

    if (error) {
      if (error.code === '23505') {
        toast.error('This URL slug is already taken. Try another one.');
      } else {
        toast.error('Failed to save publish settings');
      }
    } else {
      toast.success(published ? 'Portfolio published!' : 'Publish settings saved');
    }
    setSaving(false);
  };

  const copyUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      toast.success('URL copied to clipboard');
    }
  };

  if (portfolioLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const completeness = [
    { label: 'Full name', done: !!content.fullName },
    { label: 'Bio', done: !!content.bio },
    { label: 'At least one skill', done: content.skills.length > 0 },
    { label: 'At least one project', done: content.projects.length > 0 },
    { label: 'Contact email', done: !!content.email },
  ];
  const score = completeness.filter((c) => c.done).length;
  const ready = score >= 3;

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ lineHeight: '1.2' }}>Publish Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">Make your portfolio accessible with a public link.</p>
      </motion.div>

      {/* Readiness Check */}
      <motion.div
        {...fadeUp(1)}
        className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Portfolio Readiness</h2>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            ready ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
          }`}>
            {score}/{completeness.length} complete
          </span>
        </div>
        <div className="space-y-2">
          {completeness.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 text-sm">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
              <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Publish Toggle */}
      <motion.div
        {...fadeUp(2)}
        className="rounded-2xl border border-border/50 bg-card p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              published ? 'bg-emerald-500/10' : 'bg-muted'
            }`}>
              <Globe className={`h-5 w-5 ${published ? 'text-emerald-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">{published ? 'Published' : 'Unpublished'}</p>
              <p className="text-xs text-muted-foreground">
                {published ? 'Your portfolio is live and accessible' : 'Only you can see your portfolio'}
              </p>
            </div>
          </div>
          <Switch checked={published} onCheckedChange={setPublished} />
        </div>

        {/* URL Slug */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Public URL Slug</label>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-lg border border-border/50 bg-muted/30 px-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{baseUrl}/p/</span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="your-portfolio"
                className="border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
              />
            </div>
            <Button variant="outline" size="sm" onClick={generateSlug} className="text-xs shrink-0 active:scale-[0.97]">
              Generate
            </Button>
          </div>
        </div>

        {/* Public URL preview */}
        {published && slug && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3"
          >
            <LinkIcon className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="flex-1 text-xs font-medium text-emerald-700 truncate">{publicUrl}</span>
            <button onClick={copyUrl} className="rounded-md p-1.5 hover:bg-emerald-500/10 transition-colors active:scale-[0.95]">
              <Copy className="h-3.5 w-3.5 text-emerald-600" />
            </button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-md p-1.5 hover:bg-emerald-500/10 transition-colors active:scale-[0.95]">
              <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
            </a>
          </motion.div>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full active:scale-[0.98]"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
          {saving ? 'Saving…' : published ? 'Publish Portfolio' : 'Save Settings'}
        </Button>
      </motion.div>

      {/* Share Options */}
      {published && slug && (
        <motion.div {...fadeUp(3)} className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Share Your Portfolio</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: 'Copy Link', icon: Copy, onClick: copyUrl },
              { label: 'Open Preview', icon: Eye, onClick: () => window.open(publicUrl, '_blank') },
            ].map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex items-center gap-3 rounded-xl border border-border/50 p-4 text-left hover:bg-muted/50 transition-colors active:scale-[0.98]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
