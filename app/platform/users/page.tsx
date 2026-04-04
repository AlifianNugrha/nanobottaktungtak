
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search, Loader2, Trash, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUsers } from '@/app/actions/user-actions';
import { deleteUserById, grantProAccess } from '@/app/actions/platform-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-500/20 text-red-300';
    case 'PRO_USER':
      return 'bg-purple-500/20 text-purple-300';
    default:
      return 'bg-blue-500/20 text-blue-300';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-500/20 text-emerald-300';
    case 'Inactive':
      return 'bg-gray-500/20 text-gray-300';
    case 'Pending':
      return 'bg-amber-500/20 text-amber-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    const res = await getUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    }
    setIsLoading(false);
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor all users in the system.
          </p>
        </div>
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Card className="bg-card border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Plan</TableHead>
                <TableHead className="text-muted-foreground w-[200px]">Token Usage</TableHead>
                <TableHead className="text-muted-foreground">Subscription</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <TableCell className="text-foreground font-medium">
                      <div className="flex flex-col">
                        <span>{user.name || 'No Name'}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === 'PRO_USER' ? 'Pro Plan' : (user.role === 'ADMIN' ? 'Admin' : 'Free Tier')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{user.currentTokenUsage || 0} used</span>
                          <span>{user.maxTokenLimit > 5000 ? user.maxTokenLimit : (user.role === 'PRO_USER' ? 100000 : 5000)} limit</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${user.role === 'PRO_USER' ? 'bg-purple-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, ((user.currentTokenUsage || 0) / (user.maxTokenLimit > 5000 ? user.maxTokenLimit : (user.role === 'PRO_USER' ? 100000 : 5000))) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.subscriptionStart ? (
                        <div className="flex flex-col">
                          <span>Since: {new Date(user.subscriptionStart).toLocaleDateString()}</span>
                          {user.subscriptionEnd ? (
                            <span className={new Date(user.subscriptionEnd) < new Date() ? "text-red-500 font-bold" : "text-amber-500"}>
                              Exp: {new Date(user.subscriptionEnd).toLocaleDateString()}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        user.role === 'PRO_USER' ? <span className="text-purple-400 font-medium">Legacy Pro (No Expiry)</span> : <span className="italic">No Active Sub</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
                          {user.role !== 'PRO_USER' && (
                            <>
                              <DropdownMenuItem
                                className="text-purple-400 focus:text-purple-300 focus:bg-purple-500/10 cursor-pointer flex items-center gap-2"
                                onClick={async () => {
                                  if (confirm(`Activate Pro (1 Month) for ${user.name || user.email}?`)) {
                                    setIsLoading(true);
                                    const result = await grantProAccess(user.id, 30);
                                    if (result.success) load();
                                    setIsLoading(false);
                                  }
                                }}
                              >
                                <Crown className="w-4 h-4" />
                                Activate Pro (1 Month)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-purple-400 focus:text-purple-300 focus:bg-purple-500/10 cursor-pointer flex items-center gap-2"
                                onClick={async () => {
                                  if (confirm(`Activate Pro (3 Months) for ${user.name || user.email}?`)) {
                                    setIsLoading(true);
                                    const result = await grantProAccess(user.id, 90);
                                    if (result.success) load();
                                    setIsLoading(false);
                                  }
                                }}
                              >
                                <Crown className="w-4 h-4" />
                                Activate Pro (3 Months)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-purple-400 focus:text-purple-300 focus:bg-purple-500/10 cursor-pointer flex items-center gap-2"
                                onClick={async () => {
                                  if (confirm(`Activate Pro (1 Year) for ${user.name || user.email}?`)) {
                                    setIsLoading(true);
                                    const result = await grantProAccess(user.id, 365);
                                    if (result.success) load();
                                    setIsLoading(false);
                                  }
                                }}
                              >
                                <Crown className="w-4 h-4" />
                                Activate Pro (1 Year)
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer flex items-center gap-2"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
                                setIsLoading(true);
                                await deleteUserById(user.id);
                                setUsers(users.filter(u => u.id !== user.id));
                                setIsLoading(false);
                              }
                            }}
                          >
                            <Trash className="w-4 h-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <p>Showing {filteredUsers.length} of {users.length} users</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
