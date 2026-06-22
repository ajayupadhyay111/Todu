import { useMutation } from 'convex/react';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { api } from '@/convex/_generated/api';

// Foreground notifications: show a banner + play sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests notification permission and registers the device's Expo push token
 * with Convex. Safe to call once the user is signed in. No-ops on simulators.
 */
export function usePushNotifications() {
  const registerToken = useMutation(api.users.registerPushToken);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!Device.isDevice) return; // push only works on physical devices

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      const { status: existing } = await Notifications.getPermissionsAsync();
      let status = existing;
      if (existing !== 'granted') {
        status = (await Notifications.requestPermissionsAsync()).status;
      }
      if (status !== 'granted') return;

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        const token = (await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        )).data;
        if (!cancelled && token) await registerToken({ token });
      } catch {
        // token fetch can fail without an EAS project configured — non-fatal
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [registerToken]);
}
