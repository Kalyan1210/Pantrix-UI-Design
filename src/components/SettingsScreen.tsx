import { ChevronRight, User, Users, Bell, Settings as SettingsIcon, HelpCircle, LogOut, Moon, Sun, Trash2, Info } from "lucide-react";
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
import { hapticLight, hapticMedium, hapticHeavy } from "../lib/haptics";

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
    hapticMedium();
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
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto safe-area-top">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* Profile Section */}
      <Card className="p-4 mb-6 animate-slide-in-bottom card-interactive" style={{ animationDelay: '0.05s' }}>
        <button
          onClick={() => {
            hapticLight();
            setIsProfileModalOpen(true);
          }}
          className="w-full flex items-center gap-4 rounded-lg -m-2 p-2"
        >
          <Avatar className="w-16 h-16 ring-2 ring-primary/20">
            {userPhotoUrl && <AvatarImage src={userPhotoUrl} alt={userName} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <h2 className="mb-1 font-medium">{userName}</h2>
            <p className="text-muted-foreground text-sm">{userEmail}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </Card>

      {/* Household Section */}
      <div className="mb-6 animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
        <h3 className="mb-3 text-muted-foreground text-sm font-medium">Household</h3>
        <Card>
          <button
            onClick={() => {
              hapticLight();
              onNavigateToHousehold();
            }}
            className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors touch-feedback"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">My Household</p>
              <p className="text-muted-foreground text-sm">Manage members</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Notifications Section */}
      <div className="mb-6 animate-slide-in-bottom" style={{ animationDelay: '0.15s' }}>
        <h3 className="mb-3 text-muted-foreground text-sm font-medium">Notifications</h3>
        <Card className="divide-y">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-muted-foreground text-sm">Get alerts for expiring items</p>
              </div>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={(checked) => {
                hapticLight();
                handlePushNotificationsChange(checked);
              }}
            />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-muted-foreground text-sm">Weekly summary emails</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) => {
                hapticLight();
                handleEmailNotificationsChange(checked);
              }}
            />
          </div>
        </Card>
      </div>

      {/* Preferences Section */}
      <div className="mb-6 animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
        <h3 className="mb-3 text-muted-foreground text-sm font-medium">Preferences</h3>
        <Card className="divide-y">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-muted-foreground text-sm">Toggle app theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
          <button
            onClick={() => {
              hapticLight();
              setIsSpoilageModalOpen(true);
            }}
            className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors touch-feedback"
          >
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="font-medium">Spoilage Alert Settings</p>
              <p className="text-muted-foreground text-sm">
                {spoilageAlertDays} {spoilageAlertDays === 1 ? 'day' : 'days'} advance warning
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Support Section */}
      <div className="mb-6 animate-slide-in-bottom" style={{ animationDelay: '0.25s' }}>
        <h3 className="mb-3 text-muted-foreground text-sm font-medium">Support</h3>
        <Card className="divide-y">
          <button
            onClick={() => {
              hapticLight();
              setSupportModalType('help');
            }}
            className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors touch-feedback"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="font-medium">Help & Support</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => {
              hapticLight();
              setSupportModalType('about');
            }}
            className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors touch-feedback"
          >
            <Info className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="font-medium">About Pantrix</p>
              <p className="text-muted-foreground text-sm">Version 1.0.0</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Logout */}
      <div className="animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
        <Button 
          variant="outline" 
          className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 touch-feedback"
          onClick={() => {
            hapticHeavy();
            handleSignOut();
          }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
        
        {/* Version info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Pantrix v1.0.0 • Made with 💚
        </p>
      </div>

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
