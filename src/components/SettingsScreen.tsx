import { ChevronRight, User, Users, Bell, Settings as SettingsIcon, HelpCircle, LogOut, Moon, Sun } from "lucide-react";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";
import { getCurrentUser } from "../lib/auth";
import { signOut } from "../lib/auth";
import { getUserPreferences, updateUserPreferences } from "../lib/preferences";
import { ProfileEditModal } from "./ProfileEditModal";
import { SpoilageAlertModal } from "./SpoilageAlertModal";
import { SupportModal } from "./SupportModal";
import { toast } from "sonner";

interface SettingsScreenProps {
  onNavigateToHousehold: () => void;
}

export function SettingsScreen({ onNavigateToHousehold }: SettingsScreenProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("U");
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | undefined>();
  const [userId, setUserId] = useState<string>("");
  const [spoilageAlertDays, setSpoilageAlertDays] = useState(3);
  
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSpoilageModalOpen, setIsSpoilageModalOpen] = useState(false);
  const [supportModalType, setSupportModalType] = useState<'help' | 'about' | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = await getCurrentUser();
    if (user) {
      setUserEmail(user.email || "");
      setUserId(user.id);
      
      // Get name from display_name (comes from getCurrentUser which reads user_metadata)
      const name = (user as any).display_name || "User";
      setUserName(name);
      
      // Get profile photo from user metadata if available
      const photoUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      setUserPhotoUrl(photoUrl);
      
      // Generate initials
      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      setUserInitials(initials || "U");

      // Try to load user preferences (may not exist if table not created)
      try {
        const prefs = await getUserPreferences(user.id);
        if (prefs) {
          setPushNotifications(prefs.enable_push_notifications);
          setEmailNotifications(prefs.enable_email_notifications);
          setSpoilageAlertDays(prefs.spoilage_alert_advance_days || 3);
          setDarkMode(prefs.theme === 'dark');
        }
      } catch (error) {
        // Preferences table may not exist, that's okay
        console.log('Could not load preferences, using defaults');
      }
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark');
    
    // Save preference locally
    localStorage.setItem('darkMode', newDarkMode ? 'true' : 'false');
    
    // Try to save to database (may not work if table doesn't exist)
    if (userId) {
      try {
        await updateUserPreferences(userId, { theme: newDarkMode ? 'dark' : 'light' });
      } catch (error) {
        // Silently fail - local storage will persist the preference
        console.log('Could not save theme to database');
      }
    }
  };

  const handlePushNotificationsChange = async (checked: boolean) => {
    setPushNotifications(checked);
    if (userId) {
      try {
        await updateUserPreferences(userId, { enable_push_notifications: checked });
        toast.success('Notification settings updated');
      } catch (error) {
        console.error('Error updating notifications:', error);
        toast.error('Failed to update settings');
      }
    }
  };

  const handleEmailNotificationsChange = async (checked: boolean) => {
    setEmailNotifications(checked);
    if (userId) {
      try {
        await updateUserPreferences(userId, { enable_email_notifications: checked });
        toast.success('Email settings updated');
      } catch (error) {
        console.error('Error updating email settings:', error);
        toast.error('Failed to update settings');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload(); // Reload to reset app state
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl">Settings</h1>
      </div>

      {/* Profile Section */}
      <Card className="p-4 mb-6">
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="w-full flex items-center gap-4 hover:bg-muted/20 transition-colors rounded-lg -m-2 p-2"
        >
          <Avatar className="w-16 h-16">
            {userPhotoUrl && <AvatarImage src={userPhotoUrl} alt={userName} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <h2 className="mb-1">{userName}</h2>
            <p className="text-muted-foreground">{userEmail}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </Card>

      {/* Household Section */}
      <div className="mb-6">
        <h3 className="mb-3 text-muted-foreground">Household</h3>
        <Card>
          <button
            onClick={onNavigateToHousehold}
            className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <p>My Household</p>
              <p className="text-muted-foreground">Manage members</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Notifications Section */}
      <div className="mb-6">
        <h3 className="mb-3 text-muted-foreground">Notifications</h3>
        <Card className="divide-y">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p>Push Notifications</p>
                <p className="text-muted-foreground">Get alerts for expiring items</p>
              </div>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={handlePushNotificationsChange}
            />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p>Email Notifications</p>
                <p className="text-muted-foreground">Weekly summary emails</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={handleEmailNotificationsChange}
            />
          </div>
        </Card>
      </div>

      {/* Preferences Section */}
      <div className="mb-6">
        <h3 className="mb-3 text-muted-foreground">Preferences</h3>
        <Card className="divide-y">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p>Dark Mode</p>
                <p className="text-muted-foreground">Toggle app theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
          <button
            onClick={() => setIsSpoilageModalOpen(true)}
            className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
          >
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p>Spoilage Alert Settings</p>
              <p className="text-muted-foreground">
                {spoilageAlertDays} {spoilageAlertDays === 1 ? 'day' : 'days'} advance warning
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Support Section */}
      <div className="mb-6">
        <h3 className="mb-3 text-muted-foreground">Support</h3>
        <Card className="divide-y">
          <button
            onClick={() => setSupportModalType('help')}
            className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p>Help & Support</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setSupportModalType('about')}
            className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
          >
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p>About Pantrix</p>
              <p className="text-muted-foreground">Version 1.0.0</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Logout */}
      <Button 
        variant="outline" 
        className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Log Out
      </Button>

      {/* Modals */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userId={userId}
        currentName={userName}
        currentEmail={userEmail}
        currentPhotoUrl={userPhotoUrl}
        currentInitials={userInitials}
        onProfileUpdated={loadUserData}
      />

      <SpoilageAlertModal
        isOpen={isSpoilageModalOpen}
        onClose={() => setIsSpoilageModalOpen(false)}
        userId={userId}
        currentDays={spoilageAlertDays}
        onUpdated={(days) => setSpoilageAlertDays(days)}
      />

      <SupportModal
        isOpen={supportModalType !== null}
        onClose={() => setSupportModalType(null)}
        type={supportModalType || 'help'}
      />
    </div>
  );
}
