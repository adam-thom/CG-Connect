"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_SCHEDULE_ENTRIES } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Phone, Truck, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeeSchedule() {
  const { user } = useAuth();
  
  if (!user) return null;

  // Mocking October 2026 starting on Thursday (4)
  const daysInMonth = 31;
  const startDay = 4; // 0=Sun, 1=Mon, ..., 4=Thu
  
  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'lead': return <Phone className="w-3.5 h-3.5 text-brand-700" />;
      case 'transfer': return <Truck className="w-3.5 h-3.5 text-slate-600" />;
      case 'cremation': return <Flame className="w-3.5 h-3.5 text-orange-600" />;
      default: return null;
    }
  };

  const currentMonthDateString = "2026-10-"; // Helper 

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Staff Schedule</h1>
          <p className="text-slate-500 mt-2 text-lg">Your master deployment calendar.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 border border-slate-200 rounded-lg bg-white shadow-sm hover:bg-slate-50 text-slate-700 font-medium text-sm flex items-center gap-2">
            Today
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
            <button className="p-2 hover:bg-slate-50 text-slate-500 border-r border-slate-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-1.5 font-semibold text-brand-900 min-w-36 text-center">October 2026</span>
            <button className="p-2 hover:bg-slate-50 text-slate-500 border-l border-slate-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 auto-rows-[120px]">
            {/* Empty padding blocks */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-slate-100 bg-slate-50/30 p-2 opacity-50"></div>
            ))}
            
            {/* Real day blocks */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayStr = String(i + 1).padStart(2, '0');
              const dateKey = `${currentMonthDateString}${dayStr}`;
              
              // Find entries for this day
              const dayEntries = MOCK_SCHEDULE_ENTRIES.filter(e => e.date === dateKey);
              const isMyShift = dayEntries.some(e => e.userId === user.id);
              
              return (
                <div 
                  key={i} 
                  className={cn(
                    "border-r border-b border-slate-100 p-2.5 transition-colors relative group",
                    isMyShift ? "bg-accent-50/30" : "hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1",
                    isMyShift ? "bg-accent-600 text-white" : "text-slate-700",
                    isMyShift === false && dateKey === "2026-10-02" && "bg-brand-900 text-white" // highlight today
                  )}>
                    {i + 1}
                  </span>
                  
                  <div className="space-y-1.5 overflow-y-auto max-h-[80px] scrollbar-hide">
                    {dayEntries.map((entry, idx) => {
                      const isMe = entry.userId === user.id;
                      return (
                        <div 
                          key={entry.id} 
                          className={cn(
                            "text-xs px-2 py-1 rounded truncate flex items-center justify-between font-medium border",
                            isMe 
                              ? "bg-white border-accent-200 text-accent-700 shadow-sm" 
                              : "bg-white border-slate-200 text-slate-600"
                          )}
                        >
                          <span>{entry.roleType}</span>
                          {getRoleIcon(entry.roleType)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full xl:w-80 space-y-6 shrink-0">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-brand-900 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
              <CalendarIcon className="w-5 h-5 text-brand-500" />
              Legend & Key
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-7 h-7 rounded bg-brand-50 border border-brand-200 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-brand-700" />
                </div>
                Lead Director / On-Call
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-7 h-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-slate-600" />
                </div>
                Transfer Specialist
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-7 h-7 rounded bg-orange-50 border border-orange-200 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
                Cremation / Prep
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm bg-gradient-to-b from-white to-accent-50/30">
            <h3 className="font-semibold text-brand-900 mb-2">Upcoming Shifts</h3>
            <p className="text-sm text-slate-600 mb-4">You are scheduled for 5 shifts in the next 14 days.</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm p-3 bg-white border border-accent-200 rounded-lg shadow-sm">
                <span className="font-semibold text-accent-700">Oct 2, Fri</span>
                <span className="text-slate-600">Transfer (1st)</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-white border border-accent-200 rounded-lg shadow-sm">
                <span className="font-semibold text-accent-700">Oct 3, Sat</span>
                <span className="text-slate-600">Support (AM)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
