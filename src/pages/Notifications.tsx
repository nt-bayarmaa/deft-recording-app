import { AppLayout } from "@/components/AppLayout";
import { useNotifications, useMarkNotificationAsRead } from "@/hooks/useQueries";
import { formatAmount, formatDate } from "@/data/mock";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

export default function Notifications() {
  const { data: notifications = [], isLoading, error } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const handleView = (id: string, read: boolean) => {
    if (!read) markAsRead.mutate(id);
  };

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Мэдэгдэл</h1>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-muted">
                <div className="w-10 h-10 rounded-full bg-muted-foreground/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
                  <div className="h-3 w-1/2 rounded bg-muted-foreground/20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive space-y-2">
            <p className="text-sm">Алдаа гарлаа</p>
            <p className="text-xs text-muted-foreground">{(error as Error).message}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-3">
            <Bell className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm">Мэдэгдэл байхгүй</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn("p-4 bg-card", !notif.read && "bg-muted/50")}
                onClick={() => handleView(notif.id, notif.read)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                    {notif.personName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatAmount(notif.amount, notif.currency)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {formatDate(notif.createdAt)}
                      </span>
                    </div>
                    {!notif.read && (
                      <span className="inline-block mt-1.5 w-2 h-2 rounded-full bg-foreground" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
