import { ArrowLeft, UserPlus, QrCode, Copy, Crown, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface HouseholdScreenProps {
  onBack: () => void;
}

export function HouseholdScreen({ onBack }: HouseholdScreenProps) {
  const members = [
    { id: '1', name: 'John Doe', email: 'john.doe@email.com', role: 'admin', initials: 'JD' },
    { id: '2', name: 'Sarah Doe', email: 'sarah.doe@email.com', role: 'member', initials: 'SD' },
    { id: '3', name: 'Mike Johnson', email: 'mike.j@email.com', role: 'member', initials: 'MJ' },
    { id: '4', name: 'Emma Wilson', email: 'emma.w@email.com', role: 'member', initials: 'EW' },
  ];

  const inviteCode = "PANTRIX-2024";

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    // In a real app, show a toast notification
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Household Management</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Household Info */}
        <Card className="p-6 mb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🏠</span>
          </div>
          <h2 className="mb-1">The Doe Family</h2>
          <p className="text-muted-foreground">{members.length} members</p>
        </Card>

        {/* Invite Section */}
        <div className="mb-6">
          <h3 className="mb-3">Invite Members</h3>
          <Card className="p-4">
            <p className="text-muted-foreground mb-4">
              Share this code with family or roommates to join your household
            </p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono">
                {inviteCode}
              </div>
              <Button size="icon" variant="outline" onClick={copyInviteCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <QrCode className="w-4 h-4 mr-2" />
                Show QR Code
              </Button>
              <Button className="flex-1">
                <UserPlus className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </div>
          </Card>
        </div>

        {/* Members List */}
        <div>
          <h3 className="mb-3">Members</h3>
          <Card className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={member.role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="truncate">{member.name}</p>
                    {member.role === 'admin' && (
                      <Badge variant="outline" className="gap-1">
                        <Crown className="w-3 h-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate">{member.email}</p>
                </div>
                {member.role !== 'admin' && (
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Pending Invitations */}
        <div className="mt-6">
          <h3 className="mb-3">Pending Invitations</h3>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p>alex.smith@email.com</p>
                <p className="text-muted-foreground">Invited 2 days ago</p>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive">
                Cancel
              </Button>
            </div>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Danger Zone */}
        <div>
          <h3 className="mb-3 text-destructive">Danger Zone</h3>
          <Card className="p-4">
            <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10">
              Leave Household
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
