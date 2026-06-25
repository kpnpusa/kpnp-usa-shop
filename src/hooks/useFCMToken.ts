import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// Permission is now handled by PushOnboarding component
// This hook only registers the token after login

// Register token after login
export const useFCMToken = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform()) return;

    const registerPush = async () => {
      try {
        const permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive !== "granted") return;

        await PushNotifications.register();

        PushNotifications.addListener("registration", async (token) => {
          console.log("FCM Token:", token.value);
          const { error } = await supabase
            .from("user_fcm_tokens")
            .upsert(
              { user_id: user.id, token: token.value, updated_at: new Date().toISOString() },
              { onConflict: "user_id,token" }
            );
          if (error) console.error("Failed to save FCM token:", error);
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.error("Push registration error:", err);
        });

        PushNotifications.addListener("pushNotificationActionPerformed", () => {
          navigate("/account?tab=notifications");
        });
      } catch (err) {
        console.error("Push notification setup error:", err);
      }
    };

    registerPush();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);
};
