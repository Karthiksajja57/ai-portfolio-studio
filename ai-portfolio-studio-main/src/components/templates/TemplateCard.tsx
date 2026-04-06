import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Sparkles, Layers } from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  tags: string[];
  color: string;
  preview: string[];
  popular?: boolean;
  isNew?: boolean;
}

interface TemplateCardProps {
  template: Template;
  index: number;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: (id: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function TemplateCard({ template, index, isSelected, isRecommended, onSelect }: TemplateCardProps) {
  const Icon = template.icon;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      onClick={() => onSelect(template.id)}
      className={`group relative cursor-pointer rounded-2xl border-2 bg-card p-5 transition-shadow duration-300 ${
        isSelected
          ? 'border-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.2)]'
          : 'border-border/50 hover:border-border hover:shadow-lg'
      }`}
    >
      {/* Badges */}
      <div className="absolute right-3 top-3 flex gap-1.5">
        {template.popular && (
          <Badge variant="secondary" className="gap-1 text-[10px] font-medium">
            <Star className="h-2.5 w-2.5" /> Popular
          </Badge>
        )}
        {template.isNew && (
          <Badge variant="outline" className="gap-1 text-[10px] font-medium border-accent text-accent-foreground">
            New
          </Badge>
        )}
        {isRecommended && (
          <Badge className="gap-1 bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/15">
            <Sparkles className="h-2.5 w-2.5" /> AI Pick
          </Badge>
        )}
      </div>

      {/* Icon */}
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: `${template.color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color: template.color }} />
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold">{template.name}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{template.description}</p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {template.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      {/* Preview sections */}
      <div className="mt-4 space-y-1.5">
        {template.preview.map((section) => (
          <div key={section} className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Layers className="h-3 w-3 shrink-0 opacity-40" />
            {section}
          </div>
        ))}
      </div>

      {/* Selected indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
          >
            <Check className="h-3.5 w-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
