import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  UserCheck,
  Play,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  History,
  ChevronDown,
  ChevronUp,
  Trophy,
  Target,
  Sparkles,
} from 'lucide-react';

interface SimulationResult {
  score: number;
  decision: 'Selected' | 'Rejected' | 'Needs Improvement';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface StoredAnalysis {
  id: string;
  score: number;
  decision: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  created_at: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' },
  }),
};

function ScoreDisplay({ score, delay = 0 }: { score: number; delay?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const color =
    score >= 8 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';
  const bgGlow =
    score >= 8
      ? 'shadow-green-500/20'
      : score >= 5
        ? 'shadow-yellow-500/20'
        : 'shadow-red-500/20';

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 0.1;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.round(current * 10) / 10);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.6, type: 'spring' }}
      className={`flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card p-8 shadow-2xl ${bgGlow}`}
    >
      <span className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Recruiter Score
      </span>
      <span className={`text-7xl font-black tabular-nums ${color}`}>
        {animatedScore.toFixed(1)}
      </span>
      <span className="text-lg text-muted-foreground">/10</span>
    </motion.div>
  );
}

function DecisionBadge({ decision }: { decision: string }) {
  const config: Record<string, { className: string; icon: React.ElementType }> = {
    Selected: {
      className: 'bg-green-500/15 text-green-400 border-green-500/30 text-base px-5 py-2',
      icon: Trophy,
    },
    Rejected: {
      className: 'bg-red-500/15 text-red-400 border-red-500/30 text-base px-5 py-2',
      icon: Target,
    },
    'Needs Improvement': {
      className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-base px-5 py-2',
      icon: Lightbulb,
    },
  };
  const c = config[decision] || config['Needs Improvement'];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
    >
      <Badge variant="outline" className={`gap-2 ${c.className}`}>
        <Icon className="h-4 w-4" />
        {decision}
      </Badge>
    </motion.div>
  );
}

function ResultSection({
  title,
  icon: Icon,
  items,
  index,
  variant = 'default',
}: {
  title: string;
  icon: React.ElementType;
  items: string[];
  index: number;
  variant?: 'strength' | 'weakness' | 'suggestion' | 'default';
}) {
  const borderMap = {
    strength: 'border-l-green-500/60',
    weakness: 'border-l-red-500/60',
    suggestion: 'border-l-primary/60',
    default: 'border-l-border',
  };

  return (
    <motion.div custom={index} variants={sectionVariants} initial="hidden" animate="visible">
      <Card className={`border-l-4 ${borderMap[variant]} transition-shadow hover:shadow-lg`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + i * 0.08 }}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function RecruiterSimulationPage() {
  const { content, loading: portfolioLoading, portfolioId } = usePortfolio();
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [history, setHistory] = useState<StoredAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load past analyses
  useEffect(() => {
    if (!user) return;
    supabase
      .from('recruiter_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setHistory(data as unknown as StoredAnalysis[]);
      });
  }, [user, result]);

  const runSimulation = async () => {
    if (!content.fullName && !content.bio && content.skills.length === 0) {
      toast.error('Please fill in your portfolio first before running the simulation.');
      return;
    }

    setRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-recruiter-simulate', {
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
      if (data?.error) throw new Error(data.error);

      setResult(data as SimulationResult);

      // Store in database
      if (user && portfolioId) {
        await supabase.from('recruiter_analyses').insert({
          user_id: user.id,
          portfolio_id: portfolioId,
          score: data.score,
          decision: data.decision,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          suggestions: data.suggestions,
          raw_response: data,
        });
      }
    } catch (e: any) {
      console.error('Simulation error:', e);
      toast.error(e.message || 'Simulation failed. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  if (portfolioLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const prevScore = history.length > 0 ? history[0].score : null;
  const scoreDiff = result && prevScore !== null ? result.score - prevScore : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Recruiter Simulation</h1>
            <p className="text-sm text-muted-foreground">
              Get realistic hiring feedback from an AI recruiter
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-semibold">Ready for your review?</h2>
              <p className="text-sm text-muted-foreground">
                Our AI recruiter will evaluate your portfolio as a real hiring manager would —
                scoring your skills, projects, and presentation.
              </p>
            </div>
            <Button
              size="lg"
              onClick={runSimulation}
              disabled={running}
              className="gap-2 px-8"
            >
              {running ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : result ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Re-run Analysis
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Simulate Recruiter Review
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
                  <Sparkles className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Recruiter is reviewing your portfolio…</p>
                  <p className="text-sm text-muted-foreground">
                    Evaluating skills, projects, and overall presentation
                  </p>
                </div>
                <Progress value={undefined} className="w-48 animate-pulse" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Score + Decision */}
            <div className="grid gap-6 sm:grid-cols-2">
              <ScoreDisplay score={result.score} delay={200} />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/50 bg-card p-8"
              >
                <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Hiring Decision
                </span>
                <DecisionBadge decision={result.decision} />
                {result.summary && (
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {result.summary}
                  </p>
                )}
                {scoreDiff !== null && scoreDiff !== 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`flex items-center gap-1 text-sm ${
                      scoreDiff > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {scoreDiff > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {scoreDiff > 0 ? '+' : ''}
                    {scoreDiff} from last review
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Sections */}
            <div className="grid gap-6 md:grid-cols-1">
              <ResultSection
                title="Strengths"
                icon={TrendingUp}
                items={result.strengths}
                index={3}
                variant="strength"
              />
              <ResultSection
                title="Weaknesses"
                icon={TrendingDown}
                items={result.weaknesses}
                index={4}
                variant="weakness"
              />
              <ResultSection
                title="Suggestions to Improve"
                icon={Lightbulb}
                items={result.suggestions}
                index={5}
                variant="suggestion"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <History className="h-4 w-4" />
            Past Reviews ({history.length})
            {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {history.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-2xl font-bold tabular-nums ${
                              item.score >= 8
                                ? 'text-green-400'
                                : item.score >= 5
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                            }`}
                          >
                            {item.score}/10
                          </span>
                          <DecisionBadge decision={item.decision} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
