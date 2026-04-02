"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_SCHEDULE_ENTRIES, MOCK_USERS, ScheduleRole } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Phone, Truck, Flame, Plus, Mail, Shield, Droplet } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { fetchAllApprovedTimeOffs } from "@/app/actions/submissions";

export default function ManagerSchedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvedTimeOffs, setApprovedTimeOffs] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [scheduleEntries, setScheduleEntries] = useState<any[]>([]);
  const [tempAssignments, setTempAssignments] = useState<Record<string, string>>({});

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
     if (isModalOpen && selectedDate) {
         const initial: Record<string, string> = {};
         REQUIRED_ROLES.forEach(role => {
            const existing = scheduleEntries.find(e => e.date === selectedDate && e.roleType === role);
            if (existing) initial[role] = existing.userId;
         });
         setTempAssignments(initial);
     }
  }, [isModalOpen, selectedDate, scheduleEntries]);

  const handleConfirmAssignments = () => {
      if (!selectedDate) return;
      const newEntries = scheduleEntries.filter(e => e.date !== selectedDate);
      Object.entries(tempAssignments).forEach(([role, userId]) => {
          if (userId) {
              newEntries.push({
                  id: `SCH-${Date.now()}-${Math.random()}`,
                  date: selectedDate,
                  userId,
                  roleType: role as ScheduleRole
              });
          }
      });
      setScheduleEntries(newEntries);
      localStorage.setItem("CG_CONNECT_SCHEDULE", JSON.stringify(newEntries));
      setIsModalOpen(false);
  };

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

  const REQUIRED_ROLES: ScheduleRole[] = [
    "Lead Director - MB",
    "Lead Director - CSG",
    "Lead Director - EVG",
    "Lead Director - EDENS",
    "TRANSFERS - FIRST",
    "TRANSFERS - SECOND",
    "TRANSFERS - BACK UP",
    "CREMATIONS",
    "PREPS",
    "ME RUN"
  ];

  const getRoleIcon = (roleType: string) => {
    if (roleType.includes("Lead Director")) return <Phone className="w-3.5 h-3.5 text-brand-700" />;
    if (roleType === "TRANSFERS - BACK UP") return <Shield className="w-3.5 h-3.5 text-slate-500" />;
    if (roleType.includes("TRANSFERS") || roleType.includes("ME RUN")) return <Truck className="w-3.5 h-3.5 text-slate-600" />;
    if (roleType === "CREMATIONS") return <Flame className="w-3.5 h-3.5 text-orange-600" />;
    if (roleType === "PREPS") return <Droplet className="w-3.5 h-3.5 text-blue-500" />;
    return null;
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleSendSchedule = () => {
    alert("Schedule has been successfully emailed to all assigned staff!");
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
    <div className="animate-in fade-in duration-500 pb-12 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Department Deployment</h1>
          <p className="text-slate-500 mt-2 text-lg">Click any date to modify shift assignments.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSendSchedule}
            className="flex items-center gap-2 px-4 py-2 bg-brand-900 text-white rounded-lg font-semibold shadow-sm hover:bg-brand-800 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Send Schedule
          </button>
          <button onClick={handleToday} className="p-2 border border-slate-200 rounded-lg bg-white shadow-sm hover:bg-slate-50 text-slate-700 font-medium text-sm">
            Today
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 text-slate-500 border-r border-slate-200"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-4 py-1.5 font-semibold text-brand-900 min-w-36 text-center">{monthName} {year}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 text-slate-500 border-l border-slate-200"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start relative z-0">
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
          <div className="flex flex-col">
            {weeks.map((week, wIdx) => {
               // Determine which Approved Time Offs span this specific week sequence
               const activeDays = week.filter(d => d !== null);
               const weekStartStr = activeDays[0]?.dateStr;
               const weekEndStr = activeDays[activeDays.length - 1]?.dateStr;

               return (
                 <div key={wIdx} className="grid grid-cols-7 relative auto-rows-[minmax(160px,auto)] border-b border-slate-200 last:border-b-0 group">
                    {/* Background cells & standard schedule entries */}
                    {week.map((day, dIdx) => {
                      if (!day) return <div key={dIdx} className="border-r border-slate-100 bg-slate-50/30 p-2 opacity-50"></div>;
                      
                      const isToday = day.dateStr === todayStr;
                      const dayEntries = scheduleEntries.filter(e => e.date === day.dateStr);

                      return (
                        <div 
                          key={dIdx} 
                          onClick={() => handleDayClick(day.dateStr)}
                          className="border-r last:border-r-0 border-slate-100 p-2 relative group-hover:bg-brand-50/10 cursor-pointer transition-colors flex flex-col"
                        >
                          <div className="flex justify-between items-start mb-1 z-20 relative">
                            <span className={cn(
                              "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full pointer-events-none",
                              isToday ? "bg-brand-900 text-white shadow-sm" : "text-slate-700"
                            )}>
                              {day.dayNum}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-brand-600 hover:bg-brand-100 transition-colors pointer-events-none">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-1 overflow-y-auto flex-1 scrollbar-hide z-20 relative mt-4">
                            {dayEntries.map(entry => {
                              const userObj = MOCK_USERS.find(u => u.id === entry.userId);
                              return (
                                <div key={entry.id} className="text-[11px] px-1.5 py-1 rounded border border-slate-200 bg-white/90 backdrop-blur-sm text-slate-700 flex justify-between items-center shadow-sm">
                                  <span className="truncate pr-1 font-medium">{userObj?.name.split(' ')[0]}</span>
                                  <span className="shrink-0">{getRoleIcon(entry.roleType)}</span>
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

                          // Assign deterministic colors based on user ID to keep bars visually consistent
                          const colors = [
                             "bg-amber-700/60 text-amber-900",
                             "bg-rose-700/60 text-rose-900",
                             "bg-indigo-700/60 text-indigo-900",
                             "bg-teal-700/60 text-teal-900",
                             "bg-brand-700/60 text-brand-900"
                          ];
                          const colorClass = colors[(toff.userId.charCodeAt(0) || 0) % colors.length];

                          return (
                            <div 
                              key={`${toff.id}-${wIdx}`} 
                              className={cn(
                                "flex items-center justify-center py-0.5 px-2 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase rounded shadow-sm text-white",
                                colorClass
                              )}
                              style={{ 
                                gridColumnStart: startCol + 1, 
                                gridColumnEnd: `span ${colSpan}` 
                              }}
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

        <div className="w-full xl:w-80 space-y-6 shrink-0 z-0">
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

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4"></div>
            <h3 className="font-bold text-red-900 mb-2 relative z-10">Upcoming Vacancies</h3>
            <p className="text-sm text-red-800 relative z-10">Weekend of Oct 10th is missing Lead coverage.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-brand-900 mb-4 pb-3 border-b border-slate-100">Today's Active Team</h3>
            <ul className="space-y-4">
              {scheduleEntries.filter(e => e.date === todayStr).map(entry => {
                const u = MOCK_USERS.find(u => u.id === entry.userId);
                return (
                  <li key={entry.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                       {getRoleIcon(entry.roleType)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-brand-900">{u?.name}</p>
                      <p className="text-xs text-slate-500 font-medium tracking-wide">{entry.roleType}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Assign Staff: ${selectedDate}`}>
        <div className="space-y-6 flex flex-col h-[75vh]">
          <p className="text-sm text-slate-600 shrink-0">Select personnel to fill all required roles for this date. Employees on scheduled Time Off are automatically removed.</p>
          
          <div className="space-y-3 overflow-y-auto pr-2 pb-2 flex-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            {REQUIRED_ROLES.map(role => {
              // Filter users who are OFF on this date (Real DB integration)
              const availableUsers = MOCK_USERS.filter(u => {
                if (!selectedDate) return true;
                const isOff = approvedTimeOffs.some(toff => 
                   toff.userId === u.id && 
                   selectedDate >= toff.startDate && 
                   selectedDate <= toff.endDate
                );
                return !isOff; // Retain users who are NOT off
              });

              return (
                <div key={role} className="flex flex-col gap-1.5 border border-slate-200 p-3 rounded-xl bg-slate-50/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {getRoleIcon(role)}
                    <label className="text-xs font-bold text-slate-800 tracking-wider uppercase">{role}</label>
                  </div>
                  <select 
                    value={tempAssignments[role] || ""}
                    onChange={(e) => setTempAssignments(prev => ({...prev, [role]: e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-700 text-sm shadow-sm transition-all"
                  >
                    <option value="">-- Click to assign staff --</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 shrink-0">
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirmAssignments} className="bg-brand-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-800 transition-colors shadow-sm">
              Confirm Assignments
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
