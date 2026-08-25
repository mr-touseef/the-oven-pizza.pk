'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/lib/hooks/usePushNotifications';

interface PushNotificationButtonProps {
  branchId: string;
  role?: 'CUSTOMER' | 'ADMIN';
}

export function PushNotificationButton({ branchId, role = 'CUSTOMER' }: PushNotificationButtonProps) {
  const { isSupported, isSubscribed, isLoading, error, subscribe, unsubscribe } =
    usePushNotifications(branchId, role);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    try {
      setSuccessMessage(null);
      if (isSubscribed) {
        await unsubscribe();
        setSuccessMessage('Notifications disabled');
      } else {
        await subscribe(branchId);
        setSuccessMessage('Notifications enabled! You will receive order updates.');
      }
    } catch (err) {
      console.error('Toggle notification error:', err);
    }
  };

  return (
    <div className="push-notification-widget">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`px-4 py-2 rounded transition-colors ${
          isSubscribed
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Loading...' : isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}

      <p className="text-xs text-gray-500 mt-2">
        {isSubscribed
          ? 'You will receive notifications when your order status changes'
          : 'Enable notifications to get live order updates'}
      </p>
    </div>
  );
}