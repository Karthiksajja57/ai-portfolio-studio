import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Trash2, Loader2, Save, LogOut, AlertTriangle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Load profile
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setProfileId(data.id);
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profileId) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio,
        avatar_url: avatarUrl || null,
      })
      .eq('id', profileId);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    // Delete profile and portfolios, then sign out
    if (!user) return;
    await supabase.from('portfolios').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('user_id', user.id);
    await signOut();
    toast.success('Account data deleted');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ lineHeight: '1.2' }}>Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account preferences.</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div {...fadeUp(1)} className="rounded-2xl border border-border/50 bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold">Profile Information</h2>
        </div>

        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover border border-border/40" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-lg font-bold">
              {(displayName || user?.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Avatar URL</label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://your-avatar-url.com/photo.jpg"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Email</label>
            <Input value={user?.email || ''} disabled className="h-9 text-sm opacity-60" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio about yourself…"
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

        <Button onClick={handleSaveProfile} disabled={saving} className="active:scale-[0.98]">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </motion.div>

      {/* Account Section */}
      <motion.div {...fadeUp(2)} className="rounded-2xl border border-border/50 bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="text-sm font-semibold">Account</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
            <div>
              <p className="text-sm font-medium">Sign Out</p>
              <p className="text-xs text-muted-foreground">Sign out of your account on this device.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5 active:scale-[0.97]">
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div {...fadeUp(3)} className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-destructive/20 p-4">
          <div>
            <p className="text-sm font-medium">Delete All Data</p>
            <p className="text-xs text-muted-foreground">Permanently delete all your portfolios and profile data.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1.5 active:scale-[0.97]">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your portfolios and profile data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>
    </div>
  );
}
