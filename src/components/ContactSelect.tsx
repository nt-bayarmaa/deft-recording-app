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
import type { Contact } from "@/types";

interface ContactSelectProps {
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export function ContactSelect({
  contacts,
  onContactsChange,
  value,
  onValueChange,
  id = "contact",
  placeholder = "Хүн сонгох хайх үүсгэх",
}: ContactSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const justClosedRef = useRef(false);

  const selectedContact = contacts.find((c) => c.id === value);
  const hasExactMatch = contacts.some(
    (c) => c.name.toLowerCase() === search.trim().toLowerCase()
  );
  const canAddNew = search.trim() && !hasExactMatch;

  const filteredContacts = contacts.filter(
    (c) =>
      !search.trim() ||
      c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const displayValue = open ? search : selectedContact ? selectedContact.name : "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canAddNew) handleAddNew();
      else if (filteredContacts.length > 0) handleSelect(filteredContacts[0].id);
    }
    if (e.key === "Escape") setOpen(false);
  };

  useEffect(() => {
    if (open) {
      setSearch(selectedContact ? selectedContact.name : "");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, selectedContact]);

  const handleSelect = (contactId: string) => {
    justClosedRef.current = true;
    onValueChange(contactId);
    setSearch("");
    setOpen(false);
  };

  const handleAddNew = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    justClosedRef.current = true;
    // Use a temp ID; the parent should create the contact via mutation
    const tempId = `temp-${Date.now()}`;
    const newContact: Contact = { id: tempId, name: trimmed, ownerUserId: "" };
    onContactsChange([...contacts, newContact]);
    onValueChange(tempId);
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
              {filteredContacts.map((contact) => (
                <CommandItem
                  key={contact.id}
                  value={contact.name}
                  onSelect={() => handleSelect(contact.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === contact.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {contact.name}
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
