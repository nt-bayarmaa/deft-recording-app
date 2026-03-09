import { AppLayout } from "@/components/AppLayout";
import { mockNotifications, formatAmount, formatDate } from "@/data/mock";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

export default function Notifications() {
  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Мэдэгдэл</h1>

        {mockNotifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-3">
            <Bell className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm">Мэдэгдэл байхгүй</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {mockNotifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "p-4 bg-card",
                  !notif.read && "bg-muted/50"
                )}
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
