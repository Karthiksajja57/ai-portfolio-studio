import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/hooks/usePortfolio';
import PortfolioForm from '@/components/portfolio/PortfolioForm';
import PortfolioPreview from '@/components/portfolio/PortfolioPreview';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Monitor, Smartphone, Save, Loader2 } from 'lucide-react';

export default function PortfolioBuilderPage() {
  const { content, updateContent, loading, saving } = usePortfolio();
  const [showPreview, setShowPreview] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-border/50 px-6 py-3"
      >
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Portfolio Builder</h1>
          {saving && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </span>
          )}
          {!saving && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <Save className="h-3 w-3" /> Auto-saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showPreview && (
            <div className="flex rounded-lg border border-border/50 p-0.5">
              <button
                onClick={() => setMobilePreview(false)}
                className={`rounded-md p-1.5 transition-colors ${!mobilePreview ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setMobilePreview(true)}
                className={`rounded-md p-1.5 transition-colors ${mobilePreview ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-1.5 active:scale-[0.98]"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? 'Hide Preview' : 'Live Preview'}
          </Button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Form */}
        <div className={`flex-1 overflow-y-auto p-6 ${showPreview ? 'border-r border-border/50' : ''}`}>
          <PortfolioForm content={content} updateContent={updateContent} />
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-[45%] min-w-[320px] overflow-hidden bg-muted/30"
          >
            <div className="border-b border-border/50 px-4 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                {mobilePreview ? 'Mobile Preview' : 'Desktop Preview'}
              </p>
            </div>
            <PortfolioPreview content={content} mobile={mobilePreview} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
