import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

interface PersonSelectProps {
  users: Person[];
  onUsersChange: (users: Person[]) => void;
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export function PersonSelect({
  users,
  onUsersChange,
  value,
  onValueChange,
  id = "user",
  placeholder = "Хүн сонгох хайх үүсгэх",
}: PersonSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const justClosedRef = useRef(false);

  const selectedUser = users.find((u) => String(u.id) === value);
  const hasExactMatch = users.some(
    (u) => u.name.toLowerCase() === search.trim().toLowerCase()
  );
  const canAddNew = search.trim() && !hasExactMatch;

  const filteredUsers = users.filter(
    (u) =>
      !search.trim() ||
      u.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const displayValue = open ? search : selectedUser ? selectedUser.name : "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canAddNew) handleAddNew();
      else if (filteredUsers.length > 0) handleSelect(String(filteredUsers[0].id));
    }
    if (e.key === "Escape") setOpen(false);
  };

  useEffect(() => {
    if (open) {
      setSearch(selectedUser ? selectedUser.name : "");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, selectedUser]);

  const handleSelect = (userId: string) => {
    justClosedRef.current = true;
    onValueChange(userId);
    setSearch("");
    setOpen(false);
  };

  const handleAddNew = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    justClosedRef.current = true;
    const newId = Math.max(0, ...users.map((u) => u.id)) + 1;
    const newUser: Person = { id: newId, name: trimmed };
    onUsersChange([...users, newUser]);
    onValueChange(String(newId));
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={cn(
            "w-full h-12 px-4 py-3.5 bg-muted/30 rounded-xl border border-border",
            "flex items-center gap-2 cursor-text",
            "focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent",
            "hover:border-muted-foreground/30 transition-colors"
          )}
          onClick={() => setOpen(true)}
        >
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            value={displayValue}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (justClosedRef.current) {
                justClosedRef.current = false;
                return;
              }
              setOpen(true);
            }}
            placeholder={placeholder}
            readOnly={!open}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <ChevronDown
            className={cn(
              "w-4 h-4 shrink-0 opacity-50 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-60">
            <CommandEmpty>Хайлтад тохирох хүн олдсонгүй</CommandEmpty>
            <CommandGroup>
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => handleSelect(String(user.id))}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === String(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {canAddNew && (
              <CommandGroup>
                <CommandItem
                  value={`__add__:${search.trim()}`}
                  onSelect={handleAddNew}
                  forceMount
                  className="cursor-pointer text-positive font-medium border-t border-border mt-1 pt-2"
                >
                  + Шинэ хүн нэмэх:{" "}
                  <span className="bg-muted px-1 py-0.5 rounded-md font-medium">
                    {search.trim()}
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
