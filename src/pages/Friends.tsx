import { AppLayout } from "@/components/AppLayout";
import { mockPersons } from "@/data/mock";
import { UserPlus, Users as UsersIcon } from "lucide-react";

export default function Friends() {
  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Найзууд</h1>
          <button className="h-9 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Нэмэх
          </button>
        </div>

        {mockPersons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-3">
            <UsersIcon className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm">Найз нэмэгдээгүй байна</p>
            <p className="text-xs">QR код уншуулах эсвэл хэрэглэгчийн ID-ээр нэмнэ үү</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {mockPersons.map((person) => (
              <div key={person.id} className="flex items-center gap-3 p-4 bg-card">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                  {person.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{person.name}</p>
                  {person.linkedUserId && (
                    <p className="text-xs text-muted-foreground">Холбогдсон</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
