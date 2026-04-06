import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '@/hooks/usePortfolio';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, Loader2, TrendingUp, TrendingDown, Shield, Target,
  CheckCircle2, AlertTriangle, ArrowRight, BarChart3, FileSearch,
  Lightbulb, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResult {
  overallScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  categories: { name: string; score: number }[];
}

function ScoreRing({ score, label, size = 120, delay = 0 }: { score: number; label: string; size?: number; delay?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const color = score >= 7 ? 'hsl(var(--accent))' : score >= 5 ? 'hsl(45 90% 50%)' : 'hsl(var(--destructive))';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ delay: delay + 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.6 }}
            className="text-2xl font-bold"
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-muted-foreground">/10</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </motion.div>
  );
}

function CategoryBar({ name, score, delay }: { name: string; score: number; delay: number }) {
  const pct = score * 10;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{score}/10</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{
            backgroundColor: pct >= 70 ? 'hsl(var(--accent))' : pct >= 50 ? 'hsl(45 90% 50%)' : 'hsl(var(--destructive))',
          }}
        />
      </div>
    </motion.div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function AnalyzerPage() {
  const { content, loading: portfolioLoading } = usePortfolio();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-portfolio-analyze', {
        body: {
          fullName: content.fullName,
          bio: content.bio,
          skills: content.skills,
          education: content.education,
          projects: content.projects,
          email: content.email,
          linkedin: content.linkedin,
          github: content.github,
        },
      });
      if (error) throw error;
      setResult(data as AnalysisResult);
    } catch (e) {
      console.error(e);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (portfolioLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
            <h1 className="text-xl font-semibold tracking-tight">Portfolio Analyzer</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Get AI-powered scoring, ATS readiness check, and improvement suggestions.
            </p>
          </div>
          <Button
            onClick={runAnalysis}
            disabled={analyzing}
            className="gap-2 active:scale-[0.97]"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : result ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {result ? 'Re-analyze' : 'Analyze Portfolio'}
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 p-6">
        {!result && !analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <FileSearch className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Ready to analyze</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Click the button above to get an AI-powered analysis of your portfolio with scoring,
              ATS compatibility check, and personalized improvement tips.
            </p>
          </motion.div>
        )}

        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Analyzing your portfolio…</p>
          </motion.div>
        )}

        {result && (
          <div className="space-y-8">
            {/* Score Rings */}
            <motion.div
              custom={0}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center justify-center gap-10 rounded-2xl border border-border/50 bg-card p-8"
            >
              <ScoreRing score={result.overallScore} label="Overall Score" size={140} delay={0} />
              <ScoreRing score={result.atsScore} label="ATS Score" size={140} delay={0.15} />
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              custom={1}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Category Breakdown</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.categories.map((cat, i) => (
                  <CategoryBar key={cat.name} name={cat.name} score={cat.score} delay={0.3 + i * 0.08} />
                ))}
              </div>
            </motion.div>

            {/* Strengths & Weaknesses */}
            <div className="grid gap-5 sm:grid-cols-2">
              <motion.div
                custom={2}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-border/50 bg-card p-6"
              >
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold">Strengths</h3>
                </div>
                <ul className="space-y-2.5">
                  {result.strengths.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                custom={3}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-border/50 bg-card p-6"
              >
                <div className="mb-4 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-semibold">Areas to Improve</h3>
                </div>
                <ul className="space-y-2.5">
                  {result.weaknesses.map((w, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                      {w}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Improvement Suggestions */}
            <motion.div
              custom={4}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="rounded-2xl border border-primary/20 bg-primary/5 p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Actionable Improvements</h3>
              </div>
              <ul className="space-y-3">
                {result.improvements.map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    className="flex items-start gap-2.5 text-xs leading-relaxed"
                  >
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
