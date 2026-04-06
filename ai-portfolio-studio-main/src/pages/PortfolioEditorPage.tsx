import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '@/hooks/usePortfolio';
import PortfolioPreview from '@/components/portfolio/PortfolioPreview';
import InlineEditableText from '@/components/portfolio/InlineEditableText';
import { PortfolioContent, EducationItem, ProjectItem } from '@/types/portfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GraduationCap, Wrench, FolderOpen, Mail, Phone, Linkedin, Github,
  Code, Plus, Trash2, X, Save, Loader2, PanelRightOpen, PanelRightClose,
  GripVertical, ExternalLink, Image as ImageIcon,
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const blockReveal = (i: number) => ({
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

function SectionDivider({ icon: Icon, label, index }: { icon: React.ElementType; label: string; index: number }) {
  return (
    <motion.div {...blockReveal(index)} className="flex items-center gap-3 pt-8 pb-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-border/50" />
    </motion.div>
  );
}

export default function PortfolioEditorPage() {
  const { content, updateContent, loading, saving } = usePortfolio();
  const [showPreview, setShowPreview] = useState(true);
  const [newSkill, setNewSkill] = useState('');

  const update = useCallback(
    (partial: Partial<PortfolioContent>) => updateContent(partial),
    [updateContent]
  );

  // Education helpers
  const addEducation = () => {
    const item: EducationItem = { id: crypto.randomUUID(), institution: '', degree: '', year: '' };
    update({ education: [...content.education, item] });
  };
  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    update({ education: content.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)) });
  };
  const removeEducation = (id: string) => {
    update({ education: content.education.filter((e) => e.id !== id) });
  };

  // Project helpers
  const addProject = () => {
    const item: ProjectItem = { id: crypto.randomUUID(), title: '', description: '', url: '', tech: [] };
    update({ projects: [...content.projects, item] });
  };
  const updateProject = (id: string, field: keyof ProjectItem, value: string | string[]) => {
    update({ projects: content.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)) });
  };
  const removeProject = (id: string) => {
    update({ projects: content.projects.filter((p) => p.id !== id) });
  };

  // Skills
  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || content.skills.includes(s)) return;
    update({ skills: [...content.skills, s] });
    setNewSkill('');
  };
  const removeSkill = (skill: string) => {
    update({ skills: content.skills.filter((s) => s !== skill) });
  };

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
        {...fadeIn}
        className="flex items-center justify-between border-b border-border/50 px-6 py-2.5 bg-card/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold tracking-tight">Portfolio Editor</h1>
          <div className="h-4 w-px bg-border/60" />
          {saving ? (
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] text-accent">
              <Save className="h-3 w-3" /> Saved
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-1.5 text-xs active:scale-[0.97]"
        >
          {showPreview ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Canvas */}
        <div className={`flex-1 overflow-y-auto ${showPreview ? 'border-r border-border/40' : ''}`}>
          <div className="mx-auto max-w-2xl px-6 py-8 space-y-1">

            {/* Profile Image */}
            <motion.div {...blockReveal(0)} className="flex items-center gap-4 mb-2">
              {content.profileImage ? (
                <img
                  src={content.profileImage}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover border border-border/40 shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/30">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Profile Image URL</label>
                <Input
                  value={content.profileImage}
                  onChange={(e) => update({ profileImage: e.target.value })}
                  placeholder="https://your-image-url.com/photo.jpg"
                  className="h-8 text-xs bg-transparent border-border/40"
                />
              </div>
            </motion.div>

            {/* Name — large inline editable */}
            <motion.div {...blockReveal(1)}>
              <InlineEditableText
                value={content.fullName}
                onChange={(v) => update({ fullName: v })}
                placeholder="Your Full Name"
                as="h1"
                className="text-3xl font-bold tracking-tight"
                />
            </motion.div>

            {/* Bio — inline editable paragraph */}
            <motion.div {...blockReveal(2)} className="mt-1">
              <InlineEditableText
                value={content.bio}
                onChange={(v) => update({ bio: v })}
                placeholder="Write a brief bio about yourself, your experience, and what you're passionate about…"
                as="p"
                multiline
                className="text-sm leading-relaxed text-muted-foreground"
              />
            </motion.div>

            {/* Education */}
            <SectionDivider icon={GraduationCap} label="Education" index={3} />
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {content.education.map((edu) => (
                  <motion.div
                    key={edu.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="group relative flex items-start gap-2 rounded-xl border border-border/40 bg-card/60 p-3 hover:border-border/70 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 mt-1 text-muted-foreground/30 shrink-0 cursor-grab" />
                    <div className="flex-1 space-y-1">
                      <InlineEditableText
                        value={edu.degree}
                        onChange={(v) => updateEducation(edu.id, 'degree', v)}
                        placeholder="Degree or certification"
                        className="text-sm font-medium"
                      />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <InlineEditableText
                          value={edu.institution}
                          onChange={(v) => updateEducation(edu.id, 'institution', v)}
                          placeholder="Institution"
                          as="span"
                          className="text-xs"
                        />
                        <span className="text-border">•</span>
                        <InlineEditableText
                          value={edu.year}
                          onChange={(v) => updateEducation(edu.id, 'year', v)}
                          placeholder="Year"
                          as="span"
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="rounded-md p-1 text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button variant="ghost" size="sm" onClick={addEducation} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground active:scale-[0.97]">
                <Plus className="h-3.5 w-3.5" /> Add education
              </Button>
            </div>

            {/* Skills */}
            <SectionDivider icon={Wrench} label="Skills" index={4} />
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence mode="popLayout">
                  {content.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/8 border border-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="rounded-full p-0.5 hover:bg-primary/15 transition-colors">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill…"
                  className="h-8 flex-1 text-xs bg-transparent border-border/40"
                />
                <Button variant="ghost" size="sm" onClick={addSkill} className="h-8 px-2 active:scale-[0.97]">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Projects */}
            <SectionDivider icon={FolderOpen} label="Projects" index={5} />
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {content.projects.map((proj) => (
                  <motion.div
                    key={proj.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="group relative rounded-xl border border-border/40 bg-card/60 p-4 hover:border-border/70 transition-colors space-y-2"
                  >
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <InlineEditableText
                        value={proj.title}
                        onChange={(v) => updateProject(proj.id, 'title', v)}
                        placeholder="Project name"
                        className="text-sm font-semibold flex-1"
                      />
                      {proj.url && (
                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    <InlineEditableText
                      value={proj.description}
                      onChange={(v) => updateProject(proj.id, 'description', v)}
                      placeholder="Describe what this project does…"
                      multiline
                      className="text-xs leading-relaxed text-muted-foreground"
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        value={proj.url}
                        onChange={(e) => updateProject(proj.id, 'url', e.target.value)}
                        placeholder="Project URL"
                        className="h-7 flex-1 text-[11px] bg-transparent border-border/30"
                      />
                    </div>

                    <Input
                      value={proj.tech.join(', ')}
                      onChange={(e) => updateProject(proj.id, 'tech', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
                      placeholder="Tech stack (comma-separated)"
                      className="h-7 text-[11px] bg-transparent border-border/30"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button variant="ghost" size="sm" onClick={addProject} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground active:scale-[0.97]">
                <Plus className="h-3.5 w-3.5" /> Add project
              </Button>
            </div>

            {/* Contact */}
            <SectionDivider icon={Mail} label="Contact & Links" index={6} />
            <motion.div {...blockReveal(7)} className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Mail, label: 'Email', key: 'email' as const, placeholder: 'you@example.com' },
                { icon: Phone, label: 'Phone', key: 'phone' as const, placeholder: '+1 234 567 8900' },
                { icon: Linkedin, label: 'LinkedIn', key: 'linkedin' as const, placeholder: 'linkedin.com/in/…' },
                { icon: Github, label: 'GitHub', key: 'github' as const, placeholder: 'github.com/…' },
              ].map(({ icon: Ic, label, key, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    <Ic className="h-3 w-3" /> {label}
                  </label>
                  <Input
                    value={content[key]}
                    onChange={(e) => update({ [key]: e.target.value })}
                    placeholder={placeholder}
                    className="h-8 text-xs bg-transparent border-border/40"
                  />
                </div>
              ))}
              <div className="sm:col-span-2 space-y-1">
                <label className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  <Code className="h-3 w-3" /> Other Profiles
                </label>
                <Input
                  value={content.codingProfiles}
                  onChange={(e) => update({ codingProfiles: e.target.value })}
                  placeholder="LeetCode, CodePen, etc."
                  className="h-8 text-xs bg-transparent border-border/40"
                />
              </div>
            </motion.div>

            <div className="h-12" />
          </div>
        </div>

        {/* Live Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '40%' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden bg-muted/20 min-w-0"
            >
              <div className="border-b border-border/40 px-4 py-2">
                <p className="text-[11px] font-medium text-muted-foreground">Live Preview</p>
              </div>
              <PortfolioPreview content={content} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
