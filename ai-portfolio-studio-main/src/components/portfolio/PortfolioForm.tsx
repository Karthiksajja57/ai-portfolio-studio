import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioContent, EducationItem, ProjectItem } from '@/types/portfolio';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  User, FileText, GraduationCap, Wrench, FolderOpen, Mail,
  Phone, Linkedin, Github, Code, Plus, Trash2, X, Sparkles, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  content: PortfolioContent;
  updateContent: (partial: Partial<PortfolioContent>) => void;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
};

function SectionHeader({ icon: Icon, title, index }: { icon: React.ElementType; title: string; index: number }) {
  return (
    <motion.div custom={index} variants={sectionVariants} initial="hidden" animate="visible"
      className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
    </motion.div>
  );
}

export default function PortfolioForm({ content, updateContent }: Props) {
  const [newSkill, setNewSkill] = useState('');
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [suggestions, setSuggestions] = useState<{ suggestions: string[]; reasoning: string } | null>(null);

  const addEducation = () => {
    const item: EducationItem = { id: crypto.randomUUID(), institution: '', degree: '', year: '' };
    updateContent({ education: [...content.education, item] });
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    updateContent({
      education: content.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
  };

  const removeEducation = (id: string) => {
    updateContent({ education: content.education.filter((e) => e.id !== id) });
  };

  const addProject = () => {
    const item: ProjectItem = { id: crypto.randomUUID(), title: '', description: '', url: '', tech: [] };
    updateContent({ projects: [...content.projects, item] });
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: string | string[]) => {
    updateContent({
      projects: content.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    });
  };

  const removeProject = (id: string) => {
    updateContent({ projects: content.projects.filter((p) => p.id !== id) });
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || content.skills.includes(s)) return;
    updateContent({ skills: [...content.skills, s] });
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    updateContent({ skills: content.skills.filter((s) => s !== skill) });
  };

  const addSuggestedSkill = (skill: string) => {
    if (content.skills.includes(skill)) return;
    updateContent({ skills: [...content.skills, skill] });
    setSuggestions((prev) =>
      prev ? { ...prev, suggestions: prev.suggestions.filter((s) => s !== skill) } : null
    );
  };

  const getSkillSuggestions = async () => {
    setSuggestingSkills(true);
    setSuggestions(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-skill-suggest', {
        body: {
          bio: content.bio,
          currentSkills: content.skills,
          education: content.education,
          projects: content.projects,
        },
      });

      if (error) throw error;
      if (data?.suggestions) {
        const filtered = data.suggestions.filter((s: string) => !content.skills.includes(s));
        setSuggestions({ suggestions: filtered, reasoning: data.reasoning });
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to get skill suggestions');
    } finally {
      setSuggestingSkills(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Personal Info */}
      <SectionHeader icon={User} title="Personal Information" index={0} />
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Full Name</Label>
          <Input value={content.fullName} onChange={(e) => updateContent({ fullName: e.target.value })} placeholder="Your name" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Profile Image URL</Label>
          <Input value={content.profileImage} onChange={(e) => updateContent({ profileImage: e.target.value })} placeholder="https://..." />
        </div>
      </motion.div>

      {/* Bio */}
      <SectionHeader icon={FileText} title="Bio" index={2} />
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <Textarea
          value={content.bio}
          onChange={(e) => updateContent({ bio: e.target.value })}
          placeholder="Write a compelling bio about yourself..."
          className="min-h-[100px] resize-none"
        />
      </motion.div>

      {/* Education */}
      <SectionHeader icon={GraduationCap} title="Education" index={4} />
      <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-3">
        <AnimatePresence>
          {content.education.map((edu) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="group relative rounded-xl border border-border/50 bg-card p-4"
            >
              <button onClick={() => removeEducation(edu.id)}
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} placeholder="Institution" />
                <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Degree" />
                <Input value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} placeholder="Year" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" size="sm" onClick={addEducation} className="active:scale-[0.98]">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Education
        </Button>
      </motion.div>

      {/* Skills */}
      <SectionHeader icon={Wrench} title="Skills" index={6} />
      <motion.div custom={7} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {content.skills.map((skill) => (
            <motion.span
              key={skill}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs font-medium"
            >
              {skill}
              <button onClick={() => removeSkill(skill)} className="ml-0.5 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Type a skill and press Enter"
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={addSkill} className="active:scale-[0.98]">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={getSkillSuggestions}
          disabled={suggestingSkills}
          className="gap-1.5 border-primary/20 text-primary hover:bg-primary/5 active:scale-[0.98]"
        >
          {suggestingSkills ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          AI Skill Suggestions
        </Button>

        {/* AI Suggestions Panel */}
        <AnimatePresence>
          {suggestions && suggestions.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3"
            >
              <p className="text-xs text-muted-foreground">{suggestions.reasoning}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.suggestions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addSuggestedSkill(skill)}
                    className="flex items-center gap-1 rounded-full border border-primary/30 bg-card px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 active:scale-[0.97]"
                  >
                    <Plus className="h-3 w-3" /> {skill}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Projects */}
      <SectionHeader icon={FolderOpen} title="Projects" index={8} />
      <motion.div custom={9} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-3">
        <AnimatePresence>
          {content.projects.map((proj) => (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="group relative rounded-xl border border-border/50 bg-card p-4 space-y-3"
            >
              <button onClick={() => removeProject(proj.id)}
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={proj.title} onChange={(e) => updateProject(proj.id, 'title', e.target.value)} placeholder="Project Title" />
                <Input value={proj.url} onChange={(e) => updateProject(proj.id, 'url', e.target.value)} placeholder="Project URL" />
              </div>
              <Textarea
                value={proj.description}
                onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                placeholder="Brief description..."
                className="min-h-[60px] resize-none"
              />
              <Input
                value={proj.tech.join(', ')}
                onChange={(e) => updateProject(proj.id, 'tech', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
                placeholder="Technologies (comma-separated)"
              />
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" size="sm" onClick={addProject} className="active:scale-[0.98]">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Project
        </Button>
      </motion.div>

      {/* Contact & Links */}
      <SectionHeader icon={Mail} title="Contact & Links" index={10} />
      <motion.div custom={11} variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email</Label>
          <Input value={content.email} onChange={(e) => updateContent({ email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> Phone</Label>
          <Input value={content.phone} onChange={(e) => updateContent({ phone: e.target.value })} placeholder="+1 234 567 8900" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Linkedin className="h-3 w-3" /> LinkedIn</Label>
          <Input value={content.linkedin} onChange={(e) => updateContent({ linkedin: e.target.value })} placeholder="linkedin.com/in/..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Github className="h-3 w-3" /> GitHub</Label>
          <Input value={content.github} onChange={(e) => updateContent({ github: e.target.value })} placeholder="github.com/..." />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Code className="h-3 w-3" /> Other Coding Profiles</Label>
          <Input value={content.codingProfiles} onChange={(e) => updateContent({ codingProfiles: e.target.value })} placeholder="LeetCode, CodePen, etc." />
        </div>
      </motion.div>
    </div>
  );
}
