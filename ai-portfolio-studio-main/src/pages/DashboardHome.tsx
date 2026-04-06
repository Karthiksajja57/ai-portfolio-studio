import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  FolderOpen,
  Clock,
  BrainCircuit,
  MessageSquare,
  Lightbulb,
  Palette,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [recentPortfolios, setRecentPortfolios] = useState<Array<{ id: string; name: string; updated_at: string }>>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('portfolios')
      .select('id, name, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) {
          setPortfolioCount(data.length);
          setRecentPortfolios(data);
        }
      });
  }, [user]);

  const stats = [
    { label: 'Portfolios', value: portfolioCount, icon: FolderOpen, color: 'text-primary' },
    { label: 'Recently Edited', value: recentPortfolios.length, icon: Clock, color: 'text-accent' },
    { label: 'AI Analyses', value: 0, icon: BrainCircuit, color: 'text-orange-500' },
  ];

  const aiTools = [
    {
      title: 'AI Chatbot',
      description: 'Career & portfolio assistant',
      icon: MessageSquare,
      color: 'bg-primary/10 text-primary',
      route: '/dashboard/chat',
    },
    {
      title: 'Skills Suggestion',
      description: 'AI-powered skill recommendations',
      icon: Lightbulb,
      color: 'bg-accent/10 text-accent',
      route: '/dashboard/builder',
    },
    {
      title: 'Design Suggestions',
      description: 'Optimize your portfolio layout',
      icon: Palette,
      color: 'bg-orange-500/10 text-orange-500',
      route: '/dashboard/templates',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold" style={{ lineHeight: '1.2' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.user_metadata?.full_name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your portfolios.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i + 1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Action */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <Button
          onClick={() => navigate('/dashboard/builder')}
          className="group bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Portfolio
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>

      {/* Recent Portfolios */}
      {recentPortfolios.length > 0 && (
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <h2 className="mb-3 text-lg font-semibold">Recent Portfolios</h2>
          <div className="space-y-2">
            {recentPortfolios.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate('/dashboard/editor')}
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Edited {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Tools */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="mb-3 text-lg font-semibold">AI Tools</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {aiTools.map((tool) => (
            <div
              key={tool.title}
              onClick={() => navigate(tool.route)}
              className="group cursor-pointer rounded-xl border border-border/50 bg-card p-5 transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.98]"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tool.color}`}>
                <tool.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">{tool.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{tool.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
