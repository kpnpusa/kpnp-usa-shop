import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      // Verify admin access via edge function before navigating
      const { data, error: adminError } = await supabase.functions.invoke("admin-orders");
      if (adminError || data?.error) {
        toast.error("Access denied. This account is not authorized as admin.");
        await supabase.auth.signOut();
        return;
      }
      navigate("/admin/orders");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-card rounded-2xl p-8">
        <h1 className="text-3xl text-center mb-2 text-gradient-red">Admin Login</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Sign in to access the admin dashboard
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required minLength={6} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
