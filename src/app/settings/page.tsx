/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 用户设置页面 - 个人信息、密码修改、语言偏好
 * 依赖关系: components/dashboard-layout, stores/auth, lib/i18n, ui/card
 * 变更同步:
 *   - 设置项变化时，需同步翻译文件
 * ============================================================================
 */

'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/language-switcher';
import { UserIcon, LockIcon, GlobeIcon, BellIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { translate } = useTranslation();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    // In dev mode, just show success toast
    toast.success(translate('settings.profileSaved') || 'Profile saved successfully');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error(translate('settings.passwordMismatch') || 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error(translate('settings.passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }
    // In dev mode, just show success toast
    toast.success(translate('settings.passwordChanged') || 'Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full">
        {/* Page Title */}
        <h1
          className="font-semibold"
          style={{
            fontSize: '24px',
            color: '#101828',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {translate('settings.title') || 'Settings'}
        </h1>

        {/* Profile Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full w-10 h-10"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <UserIcon className="h-5 w-5" style={{ color: '#4A5565' }} />
            </div>
            <div className="flex flex-col">
              <CardTitle style={{ fontFamily: 'var(--font-sans)', color: '#101828' }}>
                {translate('settings.profile') || 'Profile'}
              </CardTitle>
              <CardDescription style={{ fontFamily: 'var(--font-sans)', color: '#6A7282' }}>
                {translate('settings.profileDesc') || 'Manage your account information'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" style={{ fontFamily: 'var(--font-sans)' }}>
                {translate('auth.username') || 'Username'}
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={translate('auth.username') || 'Username'}
                style={{ fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" style={{ fontFamily: 'var(--font-sans)' }}>
                {translate('auth.email') || 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={translate('auth.email') || 'Email'}
                style={{ fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-fit">
              {translate('keys.save') || 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full w-10 h-10"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <LockIcon className="h-5 w-5" style={{ color: '#4A5565' }} />
            </div>
            <div className="flex flex-col">
              <CardTitle style={{ fontFamily: 'var(--font-sans)', color: '#101828' }}>
                {translate('settings.password') || 'Password'}
              </CardTitle>
              <CardDescription style={{ fontFamily: 'var(--font-sans)', color: '#6A7282' }}>
                {translate('settings.passwordDesc') || 'Change your password'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" style={{ fontFamily: 'var(--font-sans)' }}>
                {translate('settings.currentPassword') || 'Current Password'}
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={translate('settings.currentPassword') || 'Current Password'}
                style={{ fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" style={{ fontFamily: 'var(--font-sans)' }}>
                {translate('settings.newPassword') || 'New Password'}
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={translate('settings.newPassword') || 'New Password'}
                style={{ fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" style={{ fontFamily: 'var(--font-sans)' }}>
                {translate('auth.confirmPassword') || 'Confirm Password'}
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={translate('auth.confirmPassword') || 'Confirm Password'}
                style={{ fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <Button onClick={handleChangePassword} className="w-fit">
              {translate('settings.changePassword') || 'Change Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full w-10 h-10"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <GlobeIcon className="h-5 w-5" style={{ color: '#4A5565' }} />
            </div>
            <div className="flex flex-col">
              <CardTitle style={{ fontFamily: 'var(--font-sans)', color: '#101828' }}>
                {translate('settings.language') || 'Language'}
              </CardTitle>
              <CardDescription style={{ fontFamily: 'var(--font-sans)', color: '#6A7282' }}>
                {translate('settings.languageDesc') || 'Select your preferred language'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}