import { useRef, useState } from "react";
import { format, parse } from "date-fns";
import { enGB } from "date-fns/locale";
import { CalendarDays, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Native date and time inputs take their format from the operating system, not from
// the page: a Greek Windows shows a Greek visitor's booking form as HH/MM/EEEE and
// 12:00 MM. Nothing in HTML or CSS overrides that, and the site is in English for
// people who are not Greek. So both fields are ours.
//
// The value handed back is unchanged from before: yyyy-MM-dd and HH:mm, which is what
// the database columns and both emails expect.

type DateProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  // Nothing before this day can be picked. Used to keep a return date after the
  // outbound one.
  min?: string;
};

function parseDay(value: string): Date | undefined {
  if (!value) return undefined;

  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function DateInput({ label, value, onChange, min }: DateProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDay(value);

  // Today, with the clock cleared, so a booking for later today is still allowed.
  const earliest = parseDay(min) ?? new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start font-normal">
            <CalendarDays className="mr-2 h-4 w-4 shrink-0 text-primary" />
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected ? format(selected, "EEE, d MMM yyyy", { locale: enGB }) : "Pick a date"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom" avoidCollisions={false}>
          <Calendar
            mode="single"
            locale={enGB}
            selected={selected}
            defaultMonth={selected ?? earliest}
            disabled={{ before: earliest }}
            onSelect={(day) => {
              if (!day) return;
              onChange(format(day, "yyyy-MM-dd"));
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Quarter hours, around the clock. Finer than that is a false promise for a road
// transfer, and coarser leaves early flights without a sensible pickup.
const times = Array.from({ length: 96 }, (_, index) => {
  const hours = String(Math.floor(index / 4)).padStart(2, "0");
  const minutes = String((index % 4) * 15).padStart(2, "0");
  return `${hours}:${minutes}`;
});

type TimeProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TimeInput({ label, value, onChange }: TimeProps) {
  const [open, setOpen] = useState(false);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // The list starts at midnight, so someone on a noon pickup would open it half a day
  // away from where they are.
  //
  // Left alone, Radix focuses the first row on open and the browser scrolls it into
  // view, which is what pins the list to 00:00. So the default is refused, focus is
  // put on the chosen time instead, and the viewport is scrolled directly -- moving
  // the viewport rather than calling scrollIntoView keeps the page behind it still.
  const centreOnSelected = (event: Event) => {
    event.preventDefault();

    const node = selectedRef.current;
    const viewport = node?.closest<HTMLElement>("[data-radix-scroll-area-viewport]");
    if (!node || !viewport) return;

    node.focus({ preventScroll: true });
    viewport.scrollTop = node.offsetTop - viewport.clientHeight / 2 + node.clientHeight / 2;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start font-normal">
            <Clock3 className="mr-2 h-4 w-4 shrink-0 text-primary" />
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value || "Pick a time"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          side="bottom"
          avoidCollisions={false}
          onOpenAutoFocus={centreOnSelected}
        >
          <ScrollArea className="h-64">
            <div className="p-1">
              {times.map((time) => (
                <button
                  key={time}
                  type="button"
                  ref={time === value ? selectedRef : undefined}
                  onClick={() => {
                    onChange(time);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-sm px-3 py-1.5 text-left text-sm hover:bg-accent",
                    time === value && "bg-primary text-primary-foreground hover:bg-primary",
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
