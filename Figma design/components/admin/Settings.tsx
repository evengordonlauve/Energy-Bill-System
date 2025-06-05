
import { useState } from 'react';
import { ArrowLeftIcon, Save } from 'lucide-react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";

export default function Settings({ onBack }: { onBack: () => void }) {
  // System settings
  const [settings, setSettings] = useState({
    general: {
      siteTitle: 'Calculation Portal',
      dashboardRefreshRate: 5, // minutes
      defaultTheme: 'light',
      enableUserRegistration: false,
    },
    notifications: {
      enableEmailNotifications: true,
      notifyOnNewCalculation: true,
      notifyOnUserAction: false,
      emailFooter: 'This is an automated message from the Calculation Portal.'
    },
    security: {
      sessionTimeout: 60, // minutes
      enableTwoFactor: false,
      minimumPasswordLength: 8,
      passwordRequiresSpecialChar: true
    },
    calculations: {
      showDefaultValues: true,
      saveCalculationHistory: true,
      maxHistoryEntries: 50,
      enableExport: true
    }
  });

  // Handle setting changes
  const updateSetting = (category: string, key: string, value: any) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2>System Settings</h2>
        <Button className="ml-auto">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="calculations">Calculations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure the basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label>Portal Title</label>
                <Input 
                  value={settings.general.siteTitle}
                  onChange={(e) => updateSetting('general', 'siteTitle', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label>Dashboard Refresh Rate (minutes)</label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[settings.general.dashboardRefreshRate]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(value) => updateSetting('general', 'dashboardRefreshRate', value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{settings.general.dashboardRefreshRate}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label>Default Theme</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="theme-light"
                      checked={settings.general.defaultTheme === 'light'}
                      onChange={() => updateSetting('general', 'defaultTheme', 'light')}
                    />
                    <label htmlFor="theme-light">Light</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="theme-dark"
                      checked={settings.general.defaultTheme === 'dark'}
                      onChange={() => updateSetting('general', 'defaultTheme', 'dark')}
                    />
                    <label htmlFor="theme-dark">Dark</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="theme-system"
                      checked={settings.general.defaultTheme === 'system'}
                      onChange={() => updateSetting('general', 'defaultTheme', 'system')}
                    />
                    <label htmlFor="theme-system">System</label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label>Enable User Registration</label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register without admin approval
                  </p>
                </div>
                <Switch 
                  checked={settings.general.enableUserRegistration}
                  onCheckedChange={(checked) => updateSetting('general', 'enableUserRegistration', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label>Enable Email Notifications</label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.enableEmailNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'enableEmailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label>Notify on New Calculation</label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications when new calculations are created
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.notifyOnNewCalculation}
                  onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnNewCalculation', checked)}
                  disabled={!settings.notifications.enableEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label>Notify on User Actions</label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications when users login or make changes
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.notifyOnUserAction}
                  onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnUserAction', checked)}
                  disabled={!settings.notifications.enableEmailNotifications}
                />
              </div>
              
              <div className="space-y-2">
                <label>Email Footer Text</label>
                <Textarea 
                  value={settings.notifications.emailFooter}
                  onChange={(e) => updateSetting('notifications', 'emailFooter', e.target.value)}
                  placeholder="Text to appear in the footer of all emails"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label>Session Timeout (minutes)</label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[settings.security.sessionTimeout]}
                    min={5}
                    max={240}
                    step={5}
                    onValueChange={(value) => updateSetting('security', 'sessionTimeout', value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{settings.security.sessionTimeout}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label>Minimum Password Length</label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[settings.security.minimumPasswordLength]}
                    min={6}
                    max={16}
                    step={1}
                    onValueChange={(value) => updateSetting('security', 'minimumPasswordLength', value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{settings.security.minimumPasswordLength}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label>Enable Two-Factor Authentication</label>
                  <p className="text-sm text-muted-foreground">
                    Require additional verification during login
                  </p>
                </div>
                <Switch 
                  checked={settings.security.enableTwoFactor}
                  onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label>Require Special Characters in Password</label>
                  <p className="text-sm text-muted-foreground">
                    Passwords must contain at least one special character
                  </p>
                </div>
                <Switch 
                  checked={settings.security.passwordRequiresSpecialChar}
                  onCheckedChange={(checked) => updateSetting('security', 'passwordRequiresSpecialChar', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calculations">
          <Card>
            <CardHeader>
              <CardTitle>Calculation Settings</CardTitle>
              <CardDescription>Configure calculation behavior and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label>Show Default Values</label>
                  <p className="text-sm text-muted-foreground">
                    Pre-populate calculation forms with default values
                  </p>
                </div>
                <Switch 
                  checked={settings.calculations.showDefaultValues}
                  onCheckedChange={(checked) => updateSetting('calculations', 'showDefaultValues', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label>Save Calculation History</label>
                  <p className="text-sm text-muted-foreground">
                    Save previous calculations for future reference
                  </p>
                </div>
                <Switch 
                  checked={settings.calculations.saveCalculationHistory}
                  onCheckedChange={(checked) => updateSetting('calculations', 'saveCalculationHistory', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <label>Maximum History Entries</label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[settings.calculations.maxHistoryEntries]}
                    min={10}
                    max={100}
                    step={10}
                    onValueChange={(value) => updateSetting('calculations', 'maxHistoryEntries', value[0])}
                    className="flex-1"
                    disabled={!settings.calculations.saveCalculationHistory}
                  />
                  <span className="w-12 text-center">{settings.calculations.maxHistoryEntries}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label>Enable Export Functionality</label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to export calculation results
                  </p>
                </div>
                <Switch 
                  checked={settings.calculations.enableExport}
                  onCheckedChange={(checked) => updateSetting('calculations', 'enableExport', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
