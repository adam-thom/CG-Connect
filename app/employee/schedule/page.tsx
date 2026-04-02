"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_SCHEDULE_ENTRIES } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Phone, Truck, Flame, Shield, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAllApprovedTimeOffs } from "@/app/actions/submissions";
import { useState, useEffect } from "react";

export default function EmployeeSchedule() {
  const { user } = useAuth();
  const [approvedTimeOffs, setApprovedTimeOffs] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [scheduleEntries, setScheduleEntries] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const stored = localStorage.getItem("CG_CONNECT_SCHEDULE");
       if (stored) setScheduleEntries(JSON.parse(stored));
       else {
           localStorage.setItem("CG_CONNECT_SCHEDULE", JSON.stringify(MOCK_SCHEDULE_ENTRIES));
           setScheduleEntries(MOCK_SCHEDULE_ENTRIES);
       }
    }
  }, []);

  useEffect(() => {
    fetchAllApprovedTimeOffs().then(setApprovedTimeOffs);
  }, []);
  
  if (!user) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0=Sun
  const currentMonthDateString = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  
  const getRoleIcon = (roleType: string) => {
    if (roleType.includes("Lead Director")) return <Phone className="w-3.5 h-3.5 text-brand-700" />;
    if (roleType === "TRANSFERS - BACK UP") return <Shield className="w-3.5 h-3.5 text-slate-500" />;
    if (roleType.includes("TRANSFERS") || roleType.includes("ME RUN")) return <Truck className="w-3.5 h-3.5 text-slate-600" />;
    if (roleType === "CREMATIONS") return <Flame className="w-3.5 h-3.5 text-orange-600" />;
    if (roleType === "PREPS") return <Droplet className="w-3.5 h-3.5 text-blue-500" />;
    return null;
  };

  // Build Weeks Array for Calendar Grid
  const weeks: any[][] = [];
  let currentWeek: any[] = [];
  for(let i = 0; i < startDay; i++) currentWeek.push(null);
  
  for(let i = 1; i <= daysInMonth; i++) {
    const dayStr = String(i).padStart(2, '0');
    currentWeek.push({ dayNum: i, dateStr: `${currentMonthDateString}${dayStr}` });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while(currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Staff Schedule</h1>
          <p className="text-slate-500 mt-2 text-lg">Your master deployment calendar.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleToday} className="p-2 border border-slate-200 rounded-lg bg-white shadow-sm hover:bg-slate-50 text-slate-700 font-medium text-sm flex items-center gap-2">
            Today
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 text-slate-500 border-r border-slate-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-1.5 font-semibold text-brand-900 min-w-36 text-center">{monthName} {year}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 text-slate-500 border-l border-slate-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start relative z-0">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
          {/* Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          
          {/* Weeks Grid */}
          <div className="flex flex-col relative">
            {weeks.map((week, wIdx) => {
               const activeDays = week.filter(d => d !== null);
               const weekStartStr = activeDays[0]?.dateStr;
               const weekEndStr = activeDays[activeDays.length - 1]?.dateStr;

               return (
                 <div key={wIdx} className="grid grid-cols-7 relative auto-rows-[minmax(140px,auto)] border-b border-slate-200 last:border-b-0 group">
                    {/* Background cells & standard schedule entries */}
                    {week.map((day, dIdx) => {
                      if (!day) return <div key={dIdx} className="border-r border-slate-100 bg-slate-50/30 p-2 opacity-50"></div>;
                      
                      const isToday = day.dateStr === todayStr;
                      const dayEntries = scheduleEntries.filter(e => e.date === day.dateStr);
                      const isMyShift = dayEntries.some(e => e.userId === user.id);

                      return (
                        <div 
                          key={dIdx} 
                          className={cn(
                            "border-r last:border-r-0 border-slate-100 p-2.5 transition-colors relative group",
                            isMyShift ? "bg-accent-50/20" : "hover:bg-slate-50"
                          )}
                        >
                          <span className={cn(
                            "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1 z-20 relative",
                            isMyShift ? "bg-accent-600 text-white shadow-sm" : "text-slate-700",
                            isMyShift === false && isToday && "bg-brand-900 text-white shadow-sm" // highlight today
                          )}>
                            {day.dayNum}
                          </span>
                          
                          <div className="space-y-1.5 overflow-y-visible z-20 relative mt-3">
                            {dayEntries.map(entry => {
                              const isMe = entry.userId === user.id;
                              return (
                                <div 
                                  key={entry.id} 
                                  className={cn(
                                    "text-xs px-2 py-1 rounded truncate flex items-center justify-between font-medium border shadow-sm backdrop-blur-sm",
                                    isMe 
                                      ? "bg-white/90 border-accent-200 text-accent-700" 
                                      : "bg-white/90 border-slate-200 text-slate-600"
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

                    {/* Foreground Bar Overlay for Time Off */}
                    <div className="absolute inset-x-0 top-10 bottom-0 grid grid-cols-7 pointer-events-none z-10 px-0.5 gap-y-0.5 content-start">
                       {approvedTimeOffs.map((toff, tIdx) => {
                          const offStart = toff.startDate;
                          const offEnd = toff.endDate;

                          // Check overlap
                          if (offEnd < weekStartStr || offStart > weekEndStr) return null;

                          // Calculate span within this block
                          let startCol = week.findIndex(d => d && d.dateStr >= offStart);
                          if (startCol === -1) startCol = week.findIndex(d => d !== null);

                          let endCol = week.findLastIndex(d => d && d.dateStr <= offEnd);
                          if (endCol === -1) endCol = week.findLastIndex(d => d !== null);

                          const colSpan = endCol - startCol + 1;

                          const colors = [
                             "bg-amber-700/60 text-amber-900 border-amber-800",
                             "bg-rose-700/60 text-rose-900 border-rose-800",
                             "bg-indigo-700/60 text-indigo-900 border-indigo-800",
                             "bg-teal-700/60 text-teal-900 border-teal-800",
                             "bg-brand-700/60 text-brand-900 border-brand-800"
                          ];
                          const colorClass = colors[(toff.userId.charCodeAt(0) || 0) % colors.length];

                          return (
                            <div 
                              key={`${toff.id}-${wIdx}`} 
                              className={cn(
                                "flex items-center justify-center py-0.5 px-2 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase rounded shadow-sm text-white",
                                colorClass,
                                toff.userId === user.id && "bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400 ring-offset-1"
                              )}
                              style={{ gridColumnStart: startCol + 1, gridColumnEnd: `span ${colSpan}` }}
                            >
                              <span className="truncate drop-shadow-md">{toff.userName.split(' ')[0]} OFF</span>
                            </div>
                          );
                       })}
                    </div>
                 </div>
               )
            })}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full xl:w-80 space-y-6 shrink-0 relative z-0">
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
                <div className="w-7 h-7 rounded bg-slate-100 border border-slate-300 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-slate-500" />
                </div>
                Backup Transfer
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-7 h-7 rounded bg-orange-50 border border-orange-200 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
                Cremations
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Droplet className="w-4 h-4 text-blue-500" />
                </div>
                Preparations
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
