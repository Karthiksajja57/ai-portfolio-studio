import { motion } from 'framer-motion';
import { PortfolioContent } from '@/types/portfolio';
import { Mail, Phone, Linkedin, Github, ExternalLink } from 'lucide-react';

interface Props {
  content: PortfolioContent;
  mobile?: boolean;
}

export default function PortfolioPreview({ content, mobile }: Props) {
  const hasContent = content.fullName || content.bio || content.skills.length > 0;

  if (!hasContent) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Start filling in your details to see a live preview here.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`overflow-y-auto bg-card ${mobile ? 'max-w-[375px] mx-auto' : ''}`}
      style={{ maxHeight: 'calc(100vh - 180px)' }}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          {content.profileImage && (
            <img
              src={content.profileImage}
              alt={content.fullName}
              className="h-16 w-16 rounded-2xl object-cover border border-border/50"
            />
          )}
          <div>
            <h1 className="text-xl font-bold" style={{ lineHeight: '1.2' }}>{content.fullName}</h1>
            {content.bio && (
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{content.bio}</p>
            )}
          </div>
        </div>

        {/* Skills */}
        {content.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {content.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {content.education.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Education</h2>
            <div className="space-y-2">
              {content.education.filter(e => e.institution).map((edu) => (
                <div key={edu.id} className="rounded-lg border border-border/50 p-3">
                  <p className="text-sm font-medium">{edu.degree}</p>
                  <p className="text-xs text-muted-foreground">{edu.institution} {edu.year && `• ${edu.year}`}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {content.projects.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Projects</h2>
            <div className="space-y-2">
              {content.projects.filter(p => p.title).map((proj) => (
                <div key={proj.id} className="rounded-lg border border-border/50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{proj.title}</p>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {proj.description && <p className="mt-1 text-xs text-muted-foreground">{proj.description}</p>}
                  {proj.tech.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {proj.tech.map((t) => (
                        <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {(content.email || content.phone || content.linkedin || content.github) && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contact</h2>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {content.email && (
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {content.email}</span>
              )}
              {content.phone && (
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {content.phone}</span>
              )}
              {content.linkedin && (
                <a href={content.linkedin.startsWith('http') ? content.linkedin : `https://${content.linkedin}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline">
                  <Linkedin className="h-3 w-3" /> LinkedIn
                </a>
              )}
              {content.github && (
                <a href={content.github.startsWith('http') ? content.github : `https://${content.github}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline">
                  <Github className="h-3 w-3" /> GitHub
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
