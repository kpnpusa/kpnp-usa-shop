import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === false && data.reason === "already_unsubscribed") setStatus("already");
        else if (data.valid) setStatus("valid");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleConfirm = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Email Preferences</h1>

        {status === "loading" && <p className="text-muted-foreground">Validating…</p>}

        {status === "valid" && (
          <>
            <p className="text-muted-foreground">
              Click below to unsubscribe from app emails from KPNP America.
            </p>
            <Button variant="destructive" onClick={handleConfirm}>
              Confirm Unsubscribe
            </Button>
          </>
        )}

        {status === "success" && (
          <p className="text-green-600 font-medium">
            You have been unsubscribed successfully.
          </p>
        )}

        {status === "already" && (
          <p className="text-muted-foreground">You are already unsubscribed.</p>
        )}

        {status === "invalid" && (
          <p className="text-destructive">Invalid or expired unsubscribe link.</p>
        )}

        {status === "error" && (
          <p className="text-destructive">Something went wrong. Please try again later.</p>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
