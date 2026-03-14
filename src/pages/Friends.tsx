import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useFriends } from "@/hooks/useQueries";
import { getUserByCode, addFriend, getFriendDisplayName } from "@/data/users";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, Users as UsersIcon, Search } from "lucide-react";
import { toast } from "sonner";

export default function Friends() {
  const { appUser } = useAuth();
  const { data: friends = [], isLoading, error, refetch } = useFriends();
  const [showAdd, setShowAdd] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCode.trim() || !appUser) return;
    setAdding(true);
    try {
      const found = await getUserByCode(userCode.trim().toUpperCase());
      if (!found) {
        toast.error("Хэрэглэгч олдсонгүй");
        return;
      }
      if (found.id === appUser.id) {
        toast.error("Өөрийгөө нэмэх боломжгүй");
        return;
      }
      await addFriend(appUser.id, found.id);
      await addFriend(found.id, appUser.id);
      toast.success("Найз нэмэгдлээ");
      setUserCode("");
      setShowAdd(false);
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="h-9 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Нэмэх
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAddByCode} className="rounded-2xl border border-border p-4 bg-card space-y-3">
            <label className="text-xs text-muted-foreground font-medium">Хэрэглэгчийн код оруулах</label>
            <div className="flex gap-2">
              <input
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="U-XXXXXXXX"
                className="flex-1 h-10 px-3 bg-muted/30 rounded-xl border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={adding || !userCode.trim()}
                className="h-10 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Хайх
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive space-y-2">
            <p className="text-sm">Алдаа гарлаа</p>
            <p className="text-xs text-muted-foreground">{(error as Error).message}</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-3">
            <UsersIcon className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm">Найз нэмэгдээгүй байна</p>
            <p className="text-xs">Хэрэглэгчийн код (U-XXXXXXXX) оруулж нэмнэ үү</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {friends.map((f) => {
              const name = getFriendDisplayName(f.nickname, f.friend);
              const isShadow = !f.friend.authUserId;
              return (
                <div key={f.id} className="flex items-center gap-3 p-4 bg-card">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                    {name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{name}</p>
                    {isShadow ? (
                      <p className="text-xs text-muted-foreground">Бүртгүүлээгүй</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{f.friend.userCode}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
