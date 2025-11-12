import { AlertCircle, Clock, ChefHat, Plus, CheckCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

interface SpoilageAlertsScreenProps {
  onViewRecipes: () => void;
}

export function SpoilageAlertsScreen({ onViewRecipes }: SpoilageAlertsScreenProps) {
  const alerts = [
    { id: '1', name: 'Milk', icon: '🥛', daysLeft: 0, urgency: 'critical' },
    { id: '2', name: 'Strawberries', icon: '🍓', daysLeft: 1, urgency: 'critical' },
    { id: '3', name: 'Yogurt', icon: '🥛', daysLeft: 1, urgency: 'critical' },
    { id: '4', name: 'Bananas', icon: '🍌', daysLeft: 2, urgency: 'warning' },
    { id: '5', name: 'Lettuce', icon: '🥬', daysLeft: 3, urgency: 'warning' },
    { id: '6', name: 'Chicken Breast', icon: '🍗', daysLeft: 3, urgency: 'warning' },
    { id: '7', name: 'Cheese', icon: '🧀', daysLeft: 5, urgency: 'info' },
  ];

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return {
          icon: AlertCircle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
        };
      case 'warning':
        return {
          icon: Clock,
          color: 'text-secondary',
          bgColor: 'bg-secondary/10',
          borderColor: 'border-secondary/20',
        };
      default:
        return {
          icon: Clock,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
        };
    }
  };

  const criticalAlerts = alerts.filter(a => a.urgency === 'critical');
  const warningAlerts = alerts.filter(a => a.urgency === 'warning');
  const infoAlerts = alerts.filter(a => a.urgency === 'info');

  const renderAlertCard = (alert: any) => {
    const config = getUrgencyConfig(alert.urgency);
    const Icon = config.icon;
    
    return (
      <Card key={alert.id} className={`p-4 border ${config.borderColor}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-2xl">{alert.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="mb-1">{alert.name}</h3>
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className={config.color}>
                {alert.daysLeft === 0 ? 'Expired today' : `${alert.daysLeft} day${alert.daysLeft > 1 ? 's' : ''} left`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Plus className="w-4 h-4 mr-1" />
            Add to List
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark Used
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-1">Spoilage Alerts</h1>
        <p className="text-muted-foreground">
          {alerts.length} item{alerts.length !== 1 ? 's' : ''} requiring attention
        </p>
      </div>

      {/* Recipe Suggestion Banner */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1">Recipe Suggestions</h3>
            <p className="text-muted-foreground mb-3">
              We found 12 recipes using your expiring ingredients
            </p>
            <Button size="sm" onClick={onViewRecipes}>
              View Recipes
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs by Urgency */}
      <Tabs defaultValue="critical" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="critical" className="relative">
            Critical
            {criticalAlerts.length > 0 && (
              <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
                {criticalAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="warning">
            Warning
            {warningAlerts.length > 0 && (
              <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary">
                {warningAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-3 mt-0">
          {criticalAlerts.length > 0 ? (
            criticalAlerts.map(renderAlertCard)
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-1">All clear!</h3>
              <p className="text-muted-foreground">No critical alerts at the moment</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="warning" className="space-y-3 mt-0">
          {warningAlerts.length > 0 ? (
            warningAlerts.map(renderAlertCard)
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-1">Looking good!</h3>
              <p className="text-muted-foreground">No items expiring in the next few days</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-3 mt-0">
          {infoAlerts.map(renderAlertCard)}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="mt-6 flex gap-2">
        <Button variant="outline" className="flex-1">
          Dismiss All
        </Button>
        <Button variant="outline" className="flex-1">
          Mark All Handled
        </Button>
      </div>
    </div>
  );
}
