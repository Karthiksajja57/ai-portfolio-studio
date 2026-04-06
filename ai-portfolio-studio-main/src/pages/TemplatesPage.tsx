import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '@/hooks/usePortfolio';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import TemplateCard from '@/components/templates/TemplateCard';
import AITemplateGenerator from '@/components/templates/AITemplateGenerator';
import type { Template } from '@/components/templates/TemplateCard';
import {
  Sparkles, Loader2, Layout, ArrowRight,
  Code2, Palette, GraduationCap, Briefcase,
  Camera, Megaphone, PenTool, Rocket, Globe, Heart
} from 'lucide-react';
import { toast } from 'sonner';

const templates: Template[] = [
  {
    id: 'developer',
    name: 'Developer',
    description: 'Clean, code-centric layout with project showcases, tech stack badges, and GitHub integration highlights.',
    icon: Code2,
    tags: ['Engineering', 'Open Source', 'Tech'],
    color: 'hsl(var(--primary))',
    preview: ['Hero with terminal aesthetic', 'Project cards with live links', 'Skills as interactive chips', 'GitHub contribution grid'],
    popular: true,
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Visual-first portfolio with large imagery, case study sections, and smooth scroll transitions.',
    icon: Palette,
    tags: ['UI/UX', 'Visual Arts', 'Creative'],
    color: 'hsl(338 72% 60%)',
    preview: ['Full-bleed hero image', 'Case study grid', 'Before/after comparisons', 'Testimonial carousel'],
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Academic-friendly with education emphasis, coursework highlights, and extracurricular sections.',
    icon: GraduationCap,
    tags: ['Academic', 'Fresh Grad', 'Internships'],
    color: 'hsl(var(--accent))',
    preview: ['Education timeline', 'Coursework highlights', 'Volunteer & activities', 'Awards section'],
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional, polished layout with leadership focus, metrics-driven sections, and executive summary.',
    icon: Briefcase,
    tags: ['Executive', 'Business', 'Leadership'],
    color: 'hsl(220 60% 50%)',
    preview: ['Executive summary header', 'Key metrics dashboard', 'Experience timeline', 'Professional affiliations'],
  },
  {
    id: 'photographer',
    name: 'Photographer',
    description: 'Full-screen gallery layout with masonry grid, lightbox previews, and minimal text overlays.',
    icon: Camera,
    tags: ['Photography', 'Visual', 'Gallery'],
    color: 'hsl(30 80% 55%)',
    preview: ['Masonry image grid', 'Full-screen lightbox', 'EXIF data overlays', 'Client testimonials'],
    isNew: true,
  },
  {
    id: 'marketer',
    name: 'Marketer',
    description: 'Conversion-focused layout with campaign showcases, metrics highlights, and social proof sections.',
    icon: Megaphone,
    tags: ['Marketing', 'Growth', 'Analytics'],
    color: 'hsl(280 65% 55%)',
    preview: ['Campaign case studies', 'ROI metrics banner', 'Brand logos carousel', 'A/B test results'],
    isNew: true,
  },
  {
    id: 'writer',
    name: 'Writer',
    description: 'Typography-first layout with editorial styling, reading-friendly spacing, and publication highlights.',
    icon: PenTool,
    tags: ['Content', 'Journalism', 'Copywriting'],
    color: 'hsl(160 50% 45%)',
    preview: ['Editorial hero with byline', 'Published articles grid', 'Writing samples section', 'Awards & features'],
  },
  {
    id: 'startup',
    name: 'Startup Founder',
    description: 'Bold, pitch-deck-inspired layout with vision statement, traction metrics, and team showcase.',
    icon: Rocket,
    tags: ['Entrepreneur', 'Startup', 'Pitch'],
    color: 'hsl(15 85% 55%)',
    preview: ['Vision statement hero', 'Traction & metrics', 'Product screenshots', 'Press & media mentions'],
    isNew: true,
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    description: 'Service-oriented layout with pricing tiers, client reviews, and a built-in contact form.',
    icon: Globe,
    tags: ['Freelance', 'Services', 'Consulting'],
    color: 'hsl(190 70% 45%)',
    preview: ['Services grid', 'Pricing table', 'Client testimonials', 'Contact & availability'],
  },
  {
    id: 'nonprofit',
    name: 'Nonprofit',
    description: 'Impact-focused layout with mission statement, volunteer highlights, and donation call-to-actions.',
    icon: Heart,
    tags: ['Social Impact', 'Volunteer', 'Community'],
    color: 'hsl(350 70% 55%)',
    preview: ['Mission hero banner', 'Impact statistics', 'Volunteer stories', 'Donation & support CTA'],
  },
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { content, portfolioId } = usePortfolio();
  const [selected, setSelected] = useState<string | null>(null);
  const [recommending, setRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<{ templateId: string; reasoning: string } | null>(null);
  const [applying, setApplying] = useState(false);

  const getAIRecommendation = async () => {
    setRecommending(true);
    setRecommendation(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-template-recommend', {
        body: {
          bio: content.bio,
          skills: content.skills,
          education: content.education,
          projects: content.projects,
          templateOptions: templates.map((t) => ({ id: t.id, name: t.name, description: t.description })),
        },
      });
      if (error) throw error;
      if (data?.templateId) {
        setRecommendation({ templateId: data.templateId, reasoning: data.reasoning });
        setSelected(data.templateId);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to get AI recommendation');
    } finally {
      setRecommending(false);
    }
  };

  const applyTemplate = async (templateId: string) => {
    if (!portfolioId) {
      toast.error('No portfolio found. Please build your portfolio first.');
      return;
    }
    setApplying(true);
    const { error } = await supabase
      .from('portfolios')
      .update({ template: templateId })
      .eq('id', portfolioId);

    if (error) {
      console.error(error);
      toast.error('Failed to apply template');
    } else {
      const name = templates.find((t) => t.id === templateId)?.name || templateId;
      toast.success(`"${name}" template applied!`);
      navigate('/dashboard/builder');
    }
    setApplying(false);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="border-b border-border/50 px-6 py-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Choose a Template</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a layout, let AI recommend one, or generate your own custom template.
            </p>
          </div>
          <Button
            onClick={getAIRecommendation}
            disabled={recommending}
            className="gap-2 active:scale-[0.97]"
            size="sm"
          >
            {recommending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AI Recommend
          </Button>
        </div>
      </motion.div>

      {/* AI Recommendation Banner */}
      <AnimatePresence>
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-primary/20 bg-primary/5 px-6 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  AI recommends{' '}
                  <span className="text-primary">
                    {templates.find((t) => t.id === recommendation.templateId)?.name}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{recommendation.reasoning}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Grid */}
      <div className="flex-1 p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* AI Generator Card */}
          <AITemplateGenerator onApply={applyTemplate} />

          {templates.map((tmpl, i) => (
            <TemplateCard
              key={tmpl.id}
              template={tmpl}
              index={i}
              isSelected={selected === tmpl.id}
              isRecommended={recommendation?.templateId === tmpl.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Apply Button */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mt-8 flex justify-center"
            >
              <Button
                size="lg"
                onClick={() => applyTemplate(selected)}
                disabled={applying}
                className="gap-2 px-8 active:scale-[0.97]"
              >
                {applying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Layout className="h-4 w-4" />
                )}
                Apply {templates.find((t) => t.id === selected)?.name || selected} Template
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
