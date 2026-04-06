import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from '@/components/ui/dialog';
import { Wand2, Loader2, Sparkles, Type, Palette, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedTemplate {
  name: string;
  description: string;
  color: string;
  tags: string[];
  sections: string[];
  fonts: { display: string; body: string };
}

interface AITemplateGeneratorProps {
  onApply: (templateId: string) => void;
}

export default function AITemplateGenerator({ onApply }: AITemplateGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedTemplate | null>(null);

  const generate = async () => {
    if (!description.trim()) {
      toast.error('Describe your ideal template first');
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-template-generate', {
        body: { description: description.trim() },
      });
      if (error) throw error;
      if (data?.name) setResult(data);
      else throw new Error('No template generated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate template');
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (result) {
      // Use the generated template name as the template id (slug)
      const slug = result.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      onApply(slug);
      toast.success(`"${result.name}" template applied!`);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
          className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center transition-all hover:border-primary/60 hover:bg-primary/10 min-h-[280px]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Wand2 className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold">AI Template Generator</h3>
          <p className="text-xs leading-relaxed text-muted-foreground max-w-[200px]">
            Describe your dream portfolio design and let AI create a custom template for you.
          </p>
          <Badge className="gap-1 bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/15">
            <Sparkles className="h-2.5 w-2.5" /> AI Powered
          </Badge>
        </motion.button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Template Generator
          </DialogTitle>
          <DialogDescription>
            Describe your ideal UI/UX design — style, colors, layout, mood — and AI will generate a custom template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Textarea
            placeholder="e.g. A dark, cyberpunk-themed portfolio with neon green accents, monospace fonts, terminal-style layout with animated matrix rain background, glitch effects on headings..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={generating}
          />

          <Button onClick={generate} disabled={generating || !description.trim()} className="w-full gap-2">
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? 'Generating...' : 'Generate Template'}
          </Button>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">{result.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{result.description}</p>
                  </div>
                  <div
                    className="h-8 w-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: `hsl(${result.color})` }}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {result.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {result.sections.map((section) => (
                    <div key={section} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Layers className="h-3 w-3 shrink-0 opacity-40" />
                      {section}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Type className="h-3 w-3 opacity-50" />
                    <span>{result.fonts.display}</span>
                  </div>
                  <span className="opacity-30">+</span>
                  <div className="flex items-center gap-1.5">
                    <Type className="h-3 w-3 opacity-50" />
                    <span>{result.fonts.body}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Palette className="h-3 w-3 opacity-50" />
                    <span className="text-[11px] text-muted-foreground">hsl({result.color})</span>
                  </div>
                </div>

                <Button onClick={handleApply} className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  Apply This Template
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
