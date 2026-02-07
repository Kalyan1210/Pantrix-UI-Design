import React from "react";
import { ChevronRight, Users, Bell, Settings as SettingsIcon, HelpCircle, LogOut, Moon, Sun, Info, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { getCurrentUser } from "../lib/auth";
import { signOut } from "../lib/auth";
import { getUserPreferences, updateUserPreferences } from "../lib/preferences";
import { ProfileEditModal } from "./ProfileEditModal";
import { SpoilageAlertModal } from "./SpoilageAlertModal";
import { SupportModal } from "./SupportModal";
import { PaywallScreen } from "./PaywallScreen";
import { NotificationsModal } from "./NotificationsModal";
import { toast } from "sonner";
import { hapticLight, hapticMedium, hapticHeavy } from "../lib/haptics";
import { 
  SettingsSection, 
  SettingsRow, 
  SimpleSettingsRow,
  SimpleSettingsSwitchRow 
} from "./ui/settings-components";

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
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Notification count (in a real app, this would come from state/API)
  const [notificationCount, setNotificationCount] = useState(2);

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
    hapticLight();
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
    hapticLight();
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
      <div className="mb-6 animate-fade-in flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={() => {
            hapticLight();
            setIsNotificationsOpen(true);
          }}
          className="relative p-2 rounded-full hover:bg-muted/50 transition-colors active:scale-95"
        >
          <Bell className="w-6 h-6 text-muted-foreground" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center px-1">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>

      {/* Profile Section */}
      <Card className="p-4 mb-6 animate-slide-in-bottom card-interactive rounded-2xl" style={{ animationDelay: '0.05s' }}>
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

      {/* Upgrade to Pro Section */}
      <div className="mb-6 animate-slide-in-bottom" style={{ animationDelay: '0.08s' }}>
        <div className="bg-violet-50 dark:bg-violet-950/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-foreground">Upgrade to Pro</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Unlimited AI recipes, smart predictions, and deeper personalization.
          </p>
          <button
            onClick={() => {
              hapticMedium();
              setIsPaywallOpen(true);
            }}
            className="w-full py-3.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-semibold text-base active:scale-[0.98] transition-all"
          >
            See Plans
          </button>
        </div>
      </div>

      {/* Household Section */}
      <SettingsSection title="Household" delay="0.12s">
        <SettingsRow
          icon={<Users />}
          iconColor="teal"
          label="My Household"
          description="Manage members"
          onClick={() => {
            hapticLight();
            onNavigateToHousehold();
          }}
        />
      </SettingsSection>

      {/* Notifications Section */}
      <SettingsSection title="Notifications" delay="0.16s">
        <SimpleSettingsSwitchRow
          icon={<Bell />}
          label="Push Notifications"
          description="Get alerts for expiring items"
          checked={pushNotifications}
          onCheckedChange={handlePushNotificationsChange}
        />
        <SimpleSettingsSwitchRow
          icon={<Bell />}
          label="Email Notifications"
          description="Weekly summary emails"
          checked={emailNotifications}
          onCheckedChange={handleEmailNotificationsChange}
        />
      </SettingsSection>

      {/* Preferences Section */}
      <SettingsSection title="Preferences" delay="0.2s">
        <SimpleSettingsSwitchRow
          icon={darkMode ? <Moon /> : <Sun />}
          label="Dark Mode"
          description="Toggle app theme"
          checked={darkMode}
          onCheckedChange={toggleDarkMode}
        />
        <SimpleSettingsRow
          icon={<SettingsIcon />}
          label="Spoilage Alert Settings"
          description={`${spoilageAlertDays} ${spoilageAlertDays === 1 ? 'day' : 'days'} advance warning`}
          onClick={() => {
            hapticLight();
            setIsSpoilageModalOpen(true);
          }}
        />
      </SettingsSection>

      {/* Support Section */}
      <SettingsSection title="Support" delay="0.24s">
        <SimpleSettingsRow
          icon={<HelpCircle />}
          label="Help & Support"
          onClick={() => {
            hapticLight();
            setSupportModalType('help');
          }}
        />
        <SimpleSettingsRow
          icon={<Info />}
          label="About Pantrix"
          description="Version 1.0.0"
          onClick={() => {
            hapticLight();
            setSupportModalType('about');
          }}
        />
      </SettingsSection>

      {/* Logout */}
      <div className="animate-slide-in-bottom" style={{ animationDelay: '0.28s' }}>
        <Button 
          variant="outline" 
          className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 rounded-2xl h-12 active:scale-[0.98] transition-transform"
          onClick={() => {
            hapticHeavy();
            handleSignOut();
          }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
        
        {/* Version info */}
        <p className="text-center text-xs text-muted-foreground mt-8 mb-4">
          Pantrix v1.0.0
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

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          // Reset notification count when modal is closed (simulating read)
          setNotificationCount(0);
        }}
      />

      {/* Paywall Screen */}
      {isPaywallOpen && (
        <PaywallScreen onClose={() => setIsPaywallOpen(false)} />
      )}
    </div>
  );
}
