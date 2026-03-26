'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Mail, Phone, Camera, Shield, Key, Bell, MapPin,
  Building, AlertTriangle, CheckCircle, Trash2, Eye, EyeOff, RefreshCw
} from 'lucide-react';

export default function CustomerAccount() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; ok: boolean } | null>(null);
  const [profile, setProfile] = useState<any>({
    full_name: '', phone: '', company_name: '', bio: '',
    address: '', city: '', province: '', postal_code: '', country: 'Canada',
    avatar_url: ''
  });
  const [emailPrefs, setEmailPrefs] = useState({ marketing: true, order_updates: true, product_updates: true });
  const [passwordData, setPasswordData] = useState({ new_password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) setProfile(p);
      const { data: ep } = await supabase.from('email_preferences').select('*').eq('user_id', user.id).single();
      if (ep) setEmailPrefs(ep);
    }
    setLoading(false);
  };

  const showAlert = (msg: string, ok = true) => { setAlert({ msg, ok }); setTimeout(() => setAlert(null), 5000); };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
    if (error) showAlert(error.message, false);
    else showAlert('Profile updated successfully!');
    setSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) { showAlert('Passwords do not match', false); return; }
    if (passwordData.new_password.length < 8) { showAlert('Password must be at least 8 characters', false); return; }
    const { error } = await supabase.auth.updateUser({ password: passwordData.new_password });
    if (error) showAlert(error.message, false);
    else { showAlert('Password updated!'); setPasswordData({ new_password: '', confirm_password: '' }); }
  };

  const saveEmailPrefs = async () => {
    const { error } = await supabase.from('email_preferences').upsert({ user_id: user.id, ...emailPrefs });
    if (error) showAlert(error.message, false);
    else showAlert('Email preferences saved!');
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { showAlert(upErr.message, false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    setProfile((p: any) => ({ ...p, avatar_url: publicUrl }));
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    showAlert('Avatar updated!');
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') { showAlert('Type DELETE to confirm', false); return; }
    try {
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
      router.push('/');
    } catch (e: any) { showAlert(e.message, false); }
  };

  const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCw className="w-6 h-6 text-sky-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="relative group">
          <Avatar className="w-16 h-16 border-2 border-white/30">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-white/20 text-white text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
            <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
          </label>
        </div>
        <div>
          <h1 className="text-xl font-bold">{profile.full_name || 'Your Account'}</h1>
          <p className="text-sky-100 text-sm">{user?.email}</p>
          <Badge className="mt-1 bg-white/20 text-white border-white/30 text-xs">{profile.membership_tier || 'Bronze'} Member</Badge>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`flex gap-2 p-4 rounded-xl text-sm items-center ${alert.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {alert.ok ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          {alert.msg}
        </div>
      )}

      <Tabs defaultValue="profile">
        <TabsList className="w-full grid grid-cols-4 bg-sky-50 border border-sky-100 rounded-xl">
          <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-sky-600 data-[state=active]:text-white">
            <User className="w-3.5 h-3.5 mr-1.5" />Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl data-[state=active]:bg-sky-600 data-[state=active]:text-white">
            <Shield className="w-3.5 h-3.5 mr-1.5" />Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl data-[state=active]:bg-sky-600 data-[state=active]:text-white">
            <Bell className="w-3.5 h-3.5 mr-1.5" />Emails
          </TabsTrigger>
          <TabsTrigger value="danger" className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />Danger
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <form onSubmit={saveProfile} className="space-y-5">
              <h2 className="font-bold text-gray-900">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1"><User className="w-3 h-3" />Full Name</label>
                  <Input value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3" />Phone</label>
                  <Input value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+1 (416) 555-0100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1"><Building className="w-3 h-3" />Company / Pharmacy Name</label>
                <Input value={profile.company_name || ''} onChange={e => setProfile({...profile, company_name: e.target.value})} placeholder="Pharmacy name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Bio (optional)</label>
                <textarea value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})}
                  rows={2} placeholder="Tell us about your pharmacy…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
              </div>

              <hr className="border-gray-100" />
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-500" />Shipping Address</h2>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Street Address</label>
                <Input value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">City</label>
                  <Input value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} placeholder="Toronto" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Province</label>
                  <Input value={profile.province || ''} onChange={e => setProfile({...profile, province: e.target.value})} placeholder="ON" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Postal Code</label>
                  <Input value={profile.postal_code || ''} onChange={e => setProfile({...profile, postal_code: e.target.value})} placeholder="M5H 2N2" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="bg-sky-600 hover:bg-sky-700">
                  {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Saving…</> : 'Save Profile'}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-sky-500" />
                <p className="font-semibold text-gray-900 text-sm">Email Address</p>
              </div>
              <p className="text-gray-600 text-sm ml-6">{user?.email}</p>
              {user?.email_confirmed_at
                ? <Badge className="ml-6 mt-1 bg-green-100 text-green-700 border-green-200">✓ Verified</Badge>
                : <Badge className="ml-6 mt-1 bg-amber-100 text-amber-700 border-amber-200">Not Verified</Badge>
              }
            </div>
            <hr className="border-gray-100" />
            <form onSubmit={changePassword} className="space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Key className="w-4 h-4 text-sky-500" />Change Password</h3>
              <div className="relative">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">New Password</label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} value={passwordData.new_password}
                    onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                    placeholder="Minimum 8 characters" className="pr-10" required minLength={8} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Confirm Password</label>
                <Input type="password" value={passwordData.confirm_password}
                  onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  placeholder="Repeat new password" required />
              </div>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700">Update Password</Button>
            </form>
          </div>
        </TabsContent>

        {/* Email Preferences Tab */}
        <TabsContent value="notifications">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-bold text-gray-900">Email Notification Preferences</h2>
            {[
              { key: 'order_updates', label: 'Order Updates', desc: 'Confirmations, shipping, delivery' },
              { key: 'marketing', label: 'Marketing & Promotions', desc: 'Special offers and deals' },
              { key: 'product_updates', label: 'Product Updates', desc: 'New arrivals and restock alerts' },
            ].map(pref => (
              <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{pref.label}</p>
                  <p className="text-xs text-gray-500">{pref.desc}</p>
                </div>
                <button
                  onClick={() => setEmailPrefs((p: any) => ({ ...p, [pref.key]: !p[pref.key] }))}
                  className={`relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors ${emailPrefs[pref.key as keyof typeof emailPrefs] ? 'bg-sky-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${emailPrefs[pref.key as keyof typeof emailPrefs] ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
            <Button onClick={saveEmailPrefs} className="bg-sky-600 hover:bg-sky-700">Save Preferences</Button>
          </div>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <div className="flex items-start gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-red-700">Danger Zone</h2>
                <p className="text-sm text-red-600 mt-1">These actions are permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-800 text-sm">Delete Account Permanently</h3>
              <p className="text-xs text-red-600 mt-1 mb-4">All your data, orders history, and account information will be permanently deleted. This cannot be reversed.</p>

              {!showDeleteConfirm ? (
                <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete My Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-red-800">Type <kbd className="bg-red-100 px-1 rounded">DELETE</kbd> to confirm:</p>
                  <Input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE" className="border-red-300 focus:ring-red-400" />
                  <div className="flex gap-2">
                    <Button onClick={deleteAccount} variant="destructive" disabled={deleteConfirmText !== 'DELETE'} size="sm">
                      Permanently Delete Account
                    </Button>
                    <Button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} variant="outline" size="sm">Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
