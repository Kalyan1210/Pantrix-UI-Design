import { ChevronRight, User, Users, Bell, Settings as SettingsIcon, HelpCircle, LogOut, Moon, Sun } from "lucide-react";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useState } from "react";

interface SettingsScreenProps {
  onNavigateToHousehold: () => void;
}

export function SettingsScreen({ onNavigateToHousehold }: SettingsScreenProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl">Settings</h1>
      </div>

      {/* Profile Section */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="mb-1">John Doe</h2>
            <p className="text-muted-foreground">john.doe@email.com</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
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
              <p>The Doe Family</p>
              <p className="text-muted-foreground">4 members</p>
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
              onCheckedChange={setPushNotifications}
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
              onCheckedChange={setEmailNotifications}
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
          <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p>Spoilage Alert Settings</p>
              <p className="text-muted-foreground">3 days advance warning</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p>Default Store</p>
              <p className="text-muted-foreground">Whole Foods Market</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Support Section */}
      <div className="mb-6">
        <h3 className="mb-3 text-muted-foreground">Support</h3>
        <Card className="divide-y">
          <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p>Help & Support</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
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
      <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10">
        <LogOut className="w-5 h-5 mr-2" />
        Log Out
      </Button>
    </div>
  );
}
