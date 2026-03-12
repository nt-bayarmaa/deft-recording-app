import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Setup() {
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { session, refetchAppUser } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !session?.user?.id) return;

    setIsSubmitting(true);
    try {
      // The DB trigger already creates a row on signup. Update it with nickname.
      const { error } = await supabase
        .from("users")
        .update({ nickname: nickname.trim() })
        .eq("auth_user_id", session.user.id);

      if (error) throw error;

      // Trigger appUser refetch in AuthProvider
      refetchAppUser();

      // Small delay to let AuthProvider pick up the change
      await new Promise((r) => setTimeout(r, 600));

      navigate("/", { replace: true });
    } catch (err) {
      toast({
        title: "Алдаа",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Хэрэглэгчийн нэр</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Бусад хэрэглэгчдэд харагдах нэрээ оруулна уу
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Нэр (жнь: Бат)"
            maxLength={30}
            className="w-full h-12 px-4 bg-muted/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <button
            type="submit"
            disabled={!nickname.trim() || isSubmitting}
            className="w-full h-12 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Хадгалж байна..." : "Үргэлжлүүлэх"}
          </button>
        </form>
      </div>
    </div>
  );
}
