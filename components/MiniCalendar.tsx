"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
}

export function MiniCalendar({ selectedDate, onDateSelect }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate || "2026-10-02"));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthName = viewDate.toLocaleString("default", { month: "long" });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  return (
    <div className="cg-card w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-sans font-semibold text-ui-text-primary uppercase tracking-widest">
          {monthName} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-ui-bg-alt rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-sage" />
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-ui-bg-alt rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-sage" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-sage text-center uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {padding.map((_, i) => (
          <div key={`padding-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === new Date().toISOString().split("T")[0];

          return (
            <button
              key={day}
              onClick={() => onDateSelect(dateStr)}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all relative",
                isSelected
                  ? "bg-brand-600 text-white shadow-lg scale-110 z-10"
                  : isToday
                  ? "text-accent-on-surface bg-brand-50"
                  : "text-ui-text-secondary hover:bg-ui-bg-alt hover:text-ui-text-primary"
              )}
            >
              {day}
              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-ui-surface rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
