'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BulkActionToolbar } from '@/components/admin/bulk-toolbar';
import { AdminPagination } from '@/components/admin/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  User,
  Eye,
  Trash2,
  Crown,
  UserCheck,
  X,
  RefreshCw,
  Grid,
  List,
  Menu,
  X as XIcon
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  must_reset_password: boolean;
  created_at: string;
  last_sign_in_at?: string;
  phone?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        roleFilter === 'admin' ? user.is_admin : !user.is_admin
      );
    }

    // Status filter (based on last sign in)
    if (statusFilter !== 'all') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      filtered = filtered.filter(user => {
        if (!user.last_sign_in_at) return statusFilter === 'inactive';
        return statusFilter === 'active' 
          ? new Date(user.last_sign_in_at) > thirtyDaysAgo
          : new Date(user.last_sign_in_at) <= thirtyDaysAgo;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status');
    }
  };

  const forcePasswordReset = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ must_reset_password: true })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, must_reset_password: true } : user
      ));
    } catch (error) {
      console.error('Error forcing password reset:', error);
      alert('Failed to force password reset');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete user's cart items and orders
      await supabase.from('cart_items').delete().eq('user_id', userId);
      await supabase.from('orders').delete().eq('user_id', userId);
      
      // Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length > 0 && selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map(u => u.id));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) return;
    try {
      // Bulk delete related data first (simplified for example, should be a transaction or RPC in prod)
      await supabase.from('cart_items').delete().in('user_id', selectedIds);
      await supabase.from('orders').delete().in('user_id', selectedIds);
      
      const { error } = await supabase.from('profiles').delete().in('id', selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      fetchUsers();
    } catch (error) {
      alert('Failed to delete users');
    }
  };

  const bulkAdminToggle = async (admin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: admin })
        .in('id', selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      fetchUsers();
    } catch (error) {
      alert('Failed to update admin status');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const { success, error } = await apiClient.inviteUser(inviteEmail, inviteName);
      if (!success) throw new Error(error || 'Failed to send invitation');
      
      alert('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      fetchUsers();
    } catch (error: any) {
      console.error('Invite error:', error);
      alert(error.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
        <Button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-300"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Invite New User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.is_admin).length}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => {
                    if (!u.last_sign_in_at) return false;
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return new Date(u.last_sign_in_at) > thirtyDaysAgo;
                  }).length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Reset</p>
                <p className="text-2xl font-bold">{users.filter(u => u.must_reset_password).length}</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-xl bg-background text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-xl bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active (30 days)</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="h-10 w-px bg-gray-200 mx-1 hidden lg:block" />

              <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
                <Button 
                  variant={viewMode === 'grid' ? 'outline' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('grid')}
                  className={cn("h-8 px-2 rounded-lg", viewMode === 'grid' ? 'bg-white shadow-sm border-gray-200' : 'text-gray-500 hover:text-gray-900 border-transparent')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'outline' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('list')}
                  className={cn("h-8 px-2 rounded-lg", viewMode === 'list' ? 'bg-white shadow-sm border-gray-200' : 'text-gray-500 hover:text-gray-900 border-transparent')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'compact' ? 'outline' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('compact')}
                  className={cn("h-8 px-2 rounded-lg", viewMode === 'compact' ? 'bg-white shadow-sm border-gray-200' : 'text-gray-500 hover:text-gray-900 border-transparent')}
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BulkActionToolbar 
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDelete={bulkDelete}
        onToggleStatus={(active) => bulkAdminToggle(active)}
      />

      {/* Users Content */}
      <div className={cn(
        "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden",
        viewMode === 'grid' && "bg-transparent border-none shadow-none overflow-visible"
      )}>
        {viewMode === 'list' || viewMode === 'compact' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-4 py-3 w-10 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length > 0 && selectedIds.length === filteredUsers.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">User</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Role</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Status</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Joined</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Last Active</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                      <Users className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                      <p className="font-bold text-gray-500">No users found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={cn(
                        "hover:bg-sky-50/30 transition-colors group",
                        selectedIds.includes(user.id) && "bg-blue-50/50",
                        viewMode === 'compact' ? "h-11" : ""
                      )}
                    >
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0",
                            viewMode === 'compact' ? "w-7 h-7" : "w-10 h-10"
                          )}>
                            <User className={cn("text-primary", viewMode === 'compact' ? "w-3.5 h-3.5" : "w-5 h-5")} />
                          </div>
                          <div className="min-w-0">
                            <div className={cn("font-bold text-gray-900 truncate", viewMode === 'compact' ? "text-xs" : "text-sm")}>
                              {user.full_name || 'Unknown User'}
                            </div>
                            {viewMode !== 'compact' && <div className="text-[10px] text-muted-foreground">{user.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.is_admin ? "default" : "secondary"} className="text-[10px] font-black uppercase py-0 px-2 h-5">
                          {user.is_admin ? (
                            <><Crown className="w-2.5 h-2.5 mr-1" /> Admin</>
                          ) : (
                            <><User className="w-2.5 h-2.5 mr-1" /> User</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {user.must_reset_password && (
                            <Badge variant="destructive" className="text-[9px] font-black py-0 px-1.5 h-4 w-fit">
                              RESET REQ
                            </Badge>
                          )}
                          <div className={cn(
                            "flex items-center gap-1.5 text-[10px] font-bold",
                            user.last_sign_in_at ? "text-green-600" : "text-gray-400"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", user.last_sign_in_at ? "bg-green-500 animate-pulse" : "bg-gray-300")} />
                            {viewMode !== 'compact' && (user.last_sign_in_at ? "Active" : "Never")}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-medium text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-medium text-gray-400">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => toggleAdminStatus(user.id, user.is_admin)}>
                            {user.is_admin ? <User className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => deleteUser(user.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* User Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedUsers.map((user) => (
              <Card 
                key={user.id} 
                className={cn(
                  "group relative overflow-hidden transition-all hover:shadow-lg border-gray-200",
                  selectedIds.includes(user.id) && "ring-2 ring-blue-500 shadow-xl bg-blue-50/10"
                )}
              >
                <div className="absolute top-3 left-3 z-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                  />
                </div>

                <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-white shadow-sm" onClick={() => toggleAdminStatus(user.id, user.is_admin)}>
                      {user.is_admin ? <User className="w-3.5 h-3.5 text-gray-600" /> : <Crown className="w-3.5 h-3.5 text-yellow-600" />}
                   </Button>
                   <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-white shadow-sm" onClick={() => deleteUser(user.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                   </Button>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border-4 border-white shadow-inner">
                        <User className="w-10 h-10 text-primary/40" />
                      </div>
                      {user.is_admin && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                          <Crown className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-black text-gray-900 mb-1">{user.full_name || 'Anonymous'}</h3>
                    <p className="text-xs text-muted-foreground mb-4 truncate w-full">{user.email}</p>
                    
                    <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                      <Badge variant={user.is_admin ? "default" : "secondary"} className="text-[10px] font-black uppercase h-5">
                        {user.is_admin ? 'Admin' : 'Customer'}
                      </Badge>
                      <Badge className={cn(
                        "text-[10px] font-black uppercase h-5",
                        user.last_sign_in_at ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                      )}>
                        {user.last_sign_in_at ? 'Active' : 'Offline'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 w-full gap-2 pt-4 border-t border-gray-100">
                      <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Joined</p>
                        <p className="text-[11px] font-bold text-gray-700">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Last Active</p>
                        <p className="text-[11px] font-bold text-gray-700">
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Invitation Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl scale-in-center">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  Invite New User
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Enter full name"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsInviteModalOpen(false)}
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isInviting}
                  >
                    {isInviting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
