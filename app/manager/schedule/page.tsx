"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_SCHEDULE_ENTRIES, MOCK_USERS } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Phone, Truck, Flame, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";

export default function ManagerSchedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) return null;

  const daysInMonth = 31;
  const startDay = 4; // Thu

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'lead': return <Phone className="w-3.5 h-3.5 text-brand-700" />;
      case 'transfer': return <Truck className="w-3.5 h-3.5 text-slate-600" />;
      case 'cremation': return <Flame className="w-3.5 h-3.5 text-orange-600" />;
      default: return null;
    }
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const currentMonthDateString = "2026-10-";

  return (
    <div className="animate-in fade-in duration-500 pb-12 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Department Deployment</h1>
          <p className="text-slate-500 mt-2 text-lg">Click any date to modify shift assignments.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 border border-slate-200 rounded-lg bg-white shadow-sm hover:bg-slate-50 text-slate-700 font-medium text-sm">
            Today
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
            <button className="p-2 hover:bg-slate-50 text-slate-500 border-r border-slate-200"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-4 py-1.5 font-semibold text-brand-900 min-w-36 text-center">October 2026</span>
            <button className="p-2 hover:bg-slate-50 text-slate-500 border-l border-slate-200"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start relative z-0">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 auto-rows-[140px]">
            {/* Empty padding blocks */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-slate-100 bg-slate-50/30 p-2 opacity-50"></div>
            ))}
            
            {/* Real day blocks */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayStr = String(i + 1).padStart(2, '0');
              const dateKey = `${currentMonthDateString}${dayStr}`;
              
              const dayEntries = MOCK_SCHEDULE_ENTRIES.filter(e => e.date === dateKey);
              const isToday = dateKey === "2026-10-02";
              
              return (
                <div 
                  key={i} 
                  onClick={() => handleDayClick(dateKey)}
                  className="border-r border-b border-slate-100 p-2 relative group cursor-pointer hover:bg-brand-50/30 transition-colors flex flex-col"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full pointer-events-none",
                      isToday ? "bg-brand-900 text-white shadow-sm" : "text-slate-700"
                    )}>
                      {i + 1}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-brand-600 hover:bg-brand-100 transition-colors pointer-events-none">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto flex-1 scrollbar-hide">
                    {dayEntries.map(entry => {
                      const userObj = MOCK_USERS.find(u => u.id === entry.userId);
                      return (
                        <div key={entry.id} className="text-[11px] px-1.5 py-1 rounded border border-slate-200 bg-white text-slate-700 flex justify-between items-center shadow-sm">
                          <span className="truncate pr-1 font-medium">{userObj?.name.split(' ')[0]}</span>
                          <span className="shrink-0">{getRoleIcon(entry.roleType)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full xl:w-80 space-y-6 shrink-0 z-0">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4"></div>
            <h3 className="font-bold text-red-900 mb-2 relative z-10">Upcoming Vacancies</h3>
            <p className="text-sm text-red-800 relative z-10">Weekend of Oct 10th is missing Lead coverage.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-brand-900 mb-4 pb-3 border-b border-slate-100">Today's Active Team</h3>
            <ul className="space-y-4">
              {MOCK_SCHEDULE_ENTRIES.filter(e => e.date === "2026-10-02").map(entry => {
                const u = MOCK_USERS.find(u => u.id === entry.userId);
                return (
                  <li key={entry.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                       {getRoleIcon(entry.roleType)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-brand-900">{u?.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{entry.roleType}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Assign Staff: ${selectedDate}`}>
        <div className="space-y-6">
          <p className="text-sm text-slate-600">Select personnel to schedule for this date.</p>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Employee</label>
            <select className="w-full border border-slate-200 rounded-lg p-3 bg-white focus:ring-2 focus:ring-brand-500 font-medium text-slate-700">
              <option value="">-- Choose Staff --</option>
              {MOCK_USERS.filter(u => u.role === 'employee').map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Role Designation</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="border border-brand-200 bg-brand-50 p-3 rounded-xl cursor-pointer hover:border-brand-400 transition-colors flex flex-col items-center justify-center text-center">
                <input type="radio" name="role" className="sr-only" value="lead" />
                <Phone className="w-6 h-6 text-brand-700 mb-2" />
                <span className="text-xs font-bold text-brand-900 uppercase">Lead Dir.</span>
              </label>
              <label className="border border-slate-200 bg-white p-3 rounded-xl cursor-pointer hover:border-slate-300 transition-colors flex flex-col items-center justify-center text-center opacity-70">
                <input type="radio" name="role" className="sr-only" value="transfer" />
                <Truck className="w-6 h-6 text-slate-600 mb-2" />
                <span className="text-xs font-bold text-slate-700 uppercase">Transfer</span>
              </label>
              <label className="border border-slate-200 bg-white p-3 rounded-xl cursor-pointer hover:border-slate-300 transition-colors flex flex-col items-center justify-center text-center opacity-70">
                <input type="radio" name="role" className="sr-only" value="cremation" />
                <Flame className="w-6 h-6 text-orange-600 mb-2" />
                <span className="text-xs font-bold text-slate-700 uppercase">Preparation</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button onClick={() => setIsModalOpen(false)} className="bg-brand-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-800 transition-colors shadow-sm">
              Confirm Assignment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
