import { useEffect, useState } from 'react';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: (branchId: string, orderId?: string) => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export function usePushNotifications(
  branchId?: string,
  role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER'
): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (err) {
      console.error('[Push] Error checking subscription:', err);
    }
  };

  const subscribe = async (branchIdParam: string, orderId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const bid = branchIdParam || branchId;
      if (!bid) {
        throw new Error('branchId is required');
      }

      if (Notification.permission === 'denied') {
        throw new Error('Notification permission denied. Please enable notifications in browser settings.');
      }

      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission not granted');
        }
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Push] Service Worker registered:', registration);

      const vapidRes = await fetch('/api/customer/push/subscribe');
      if (!vapidRes.ok) throw new Error('Failed to get VAPID public key');
      const { vapidPublicKey } = await vapidRes.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      console.log('[Push] Subscribed:', subscription);

      const subscribeRes = await fetch(`/api/customer/push/subscribe?branchId=${bid}&role=${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!subscribeRes.ok) {
        throw new Error('Failed to store subscription on server');
      }

      setIsSubscribed(true);
      console.log('[Push] Successfully subscribed to notifications');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to subscribe to notifications';
      setError(message);
      console.error('[Push] Subscription error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setIsSubscribed(false);
          console.log('[Push] Unsubscribed from notifications');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setError(message);
      console.error('[Push] Unsubscribe error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}