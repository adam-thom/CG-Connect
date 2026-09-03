"use client";

import { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_USERS } from "@/lib/mock-data";
import { Plus, Trash2, Printer, ClipboardList, Save, CheckCircle2, Loader2, AlertCircle, Clock, MapPin, ChevronRight, LayoutGrid, FileText } from "lucide-react";
import Image from "next/image";
import { cn, formatDate } from "@/lib/utils";
import { MiniCalendar } from "@/components/MiniCalendar";
import { getServicesForDate, saveServiceAssignments, getDailyLineup, saveDailyNotes } from "@/app/actions/lineup";
import { useSearchParams, useRouter } from "next/navigation";

interface RoleAssignment {
  id?: string;
  roleName: string;
  staffName: string;
}

interface ScheduledService {
  id: string;
  title: string;
  time: string | null;
  location: string | null;
  assignments: RoleAssignment[];
}

const STANDARD_ROLES = [
  "Funeral Director",
  "Lead Car",
  "Coach",
  "Limo",
  "Memorial Books",
  "Usher",
  "Door",
];

export default function DailyLineupPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const urlDate = searchParams.get("date");
  const [date, setDate] = useState(urlDate || new Date().toISOString().split('T')[0]);
  const [services, setServices] = useState<ScheduledService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load lineups & services for the chosen date
  useEffect(() => {
    async function load() {
      if (!user) return;
      
      setIsLoading(true);
      setSaveStatus("idle");
      setSelectedServiceId(null);
      
      try {
        const [dayNotes, dayServices] = await Promise.all([
          getDailyLineup(date),
          getServicesForDate(date)
        ]);
        
        setNotes(dayNotes?.notes || "");
        setServices(dayServices as ScheduledService[]);
        
        if (dayServices.length > 0) {
          setSelectedServiceId(dayServices[0].id);
        }
      } catch (err) {
        console.error("Load failed", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [date, user]);

  if (!user || !isMounted) return null;

  const selectedService = services.find(s => s.id === selectedServiceId);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const params = new URLSearchParams(searchParams);
    params.set("date", newDate);
    router.push(`/manager/lineup?${params.toString()}`);
  };

  const updateAssignment = (roleIndex: number, field: keyof RoleAssignment, value: string) => {
    if (!selectedServiceId) return;
    setServices(services.map(s => {
      if (s.id !== selectedServiceId) return s;
      const newAssignments = [...s.assignments];
      newAssignments[roleIndex] = { ...newAssignments[roleIndex], [field]: value };
      return { ...s, assignments: newAssignments };
    }));
  };

  const addAssignment = () => {
    if (!selectedServiceId) return;
    setServices(services.map(s => {
      if (s.id !== selectedServiceId) return s;
      return { ...s, assignments: [...s.assignments, { roleName: "", staffName: "" }] };
    }));
  };

  const removeAssignment = (index: number) => {
    if (!selectedServiceId) return;
    setServices(services.map(s => {
      if (s.id !== selectedServiceId) return s;
      return { ...s, assignments: s.assignments.filter((_, i) => i !== index) };
    }));
  };

  const handlePrePopulate = () => {
    if (!selectedServiceId) return;
    setServices(services.map(s => {
      if (s.id !== selectedServiceId) return s;
      const existingRoles = s.assignments.map(a => a.roleName);
      const missingRoles = STANDARD_ROLES.filter(r => !existingRoles.includes(r));
      return { 
        ...s, 
        assignments: [...s.assignments, ...missingRoles.map(r => ({ roleName: r, staffName: "" }))] 
      };
    }));
  };

  const onSave = () => {
    if (!selectedService) return;
    setSaveStatus("saving");
    startTransition(async () => {
      const res1 = await saveServiceAssignments(selectedService.id, selectedService.assignments);
      const res2 = await saveDailyNotes(date, notes);
      
      if (res1.success && res2.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="animate-in fade-in duration-300 pb-20 ease-cg">
      
      {/* 
       * Screen Header 
       */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 print-hidden">
        <div>
          <p className="cg-eyebrow">Daily Operations</p>
          <h1 className="mt-2 text-4xl">Daily Line-up Manager</h1>
          <p className="mt-2 text-base font-medium text-ui-text-secondary">Refining operational details for precision execution.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
            saveStatus === "saving" ? "text-ui-text-secondary bg-ui-bg-alt" :
            saveStatus === "saved" ? "text-status-success bg-status-success-soft" :
            saveStatus === "error" ? "text-status-error bg-status-error-soft" :
            "text-ui-text-secondary bg-transparent"
          )}>
            {saveStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
            {saveStatus === "saved" && <CheckCircle2 className="w-4 h-4" />}
            {saveStatus === "error" && <AlertCircle className="w-4 h-4" />}
            {saveStatus === "saving" ? "One moment." : 
             saveStatus === "saved" ? "Saved." : 
             saveStatus === "error" ? "Something went wrong on our end. Please try again." : ""}
          </div>

          <button 
            onClick={onSave}
            disabled={saveStatus === "saving" || !selectedServiceId}
            className="cg-btn-primary"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>

          <button 
            onClick={handlePrint}
            className="cg-btn-secondary"
          >
            <Printer className="w-5 h-5" />
            Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
        
        {/* 
         * Left Sidebar: Calendar & Notes
         */}
        <div className="lg:col-span-3 space-y-8 print-hidden sticky top-8">
           <div className="space-y-3">
             <label className="ml-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ui-text-secondary">Temporal View</label>
             <MiniCalendar selectedDate={date} onDateSelect={handleDateChange} />
           </div>

           <div className="cg-card space-y-4">
              <label className="ml-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ui-text-secondary">
                 <FileText className="w-3 h-3" />
                 Daily Directives
              </label>
              <textarea 
                placeholder="Day-specific instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-40 w-full resize-none rounded-2xl border border-ui-border bg-ui-bg-alt p-5 text-sm font-medium leading-relaxed text-ui-text-primary transition-all placeholder:text-sage focus:border-brand-400 focus:bg-ui-surface focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
           </div>
        </div>
        
        {/* 
         * Center: Service List
         */}
        <div className="lg:col-span-3 space-y-8 print-hidden">
           <div className="flex items-center justify-between px-2">
              <h2 className="flex items-center gap-3 text-xs font-sans font-semibold uppercase tracking-widest text-ui-text-secondary">
                <LayoutGrid className="w-4 h-4 text-accent-on-surface" />
                Select Service
              </h2>
           </div>

           <div className="space-y-4">
             {isLoading ? (
                <div className="flex justify-center p-20 opacity-20"><Loader2 className="w-10 h-10 animate-spin" /></div>
             ) : services.length === 0 ? (
                <div className="space-y-4 rounded-3xl border-2 border-dashed border-ui-border bg-ui-surface/60 p-10 text-center">
                  <p className="text-sm font-medium text-ui-text-secondary">No services are scheduled for this date.</p>
                  <button 
                    onClick={() => window.location.href=`/manager/schedule?date=${date}`}
                    className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-bold text-accent-on-surface transition-colors hover:bg-brand-100"
                  >
                    Schedule a service
                  </button>
                </div>
             ) : services.map(s => (
               <button
                key={s.id}
                onClick={() => setSelectedServiceId(s.id)}
                className={cn(
                  "w-full text-left p-6 rounded-[2rem] border transition-all duration-300 group relative overflow-hidden",
                  selectedServiceId === s.id 
                  ? "z-10 border-brand-300 bg-brand-100 text-ui-text-primary shadow-[0_12px_30px_-16px_rgba(163,95,71,0.6)]"
                  : "border-ui-border bg-ui-surface text-ui-text-secondary hover:border-brand-200 hover:bg-brand-50"
                )}
               >
                 <div className="flex items-center justify-between mb-3 relative z-10">
                   <p className={cn(
                     "text-lg font-display transition-colors",
                     selectedServiceId === s.id ? "text-ui-text-primary" : "text-ui-text-primary"
                   )}>{s.title}</p>
                   <ChevronRight className={cn(
                     "w-5 h-5 transition-transform",
                     selectedServiceId === s.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                   )} />
                 </div>
                 <div className="space-y-1 relative z-10">
                   {s.time && <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-2"><Clock className="w-3 h-3" /> {s.time}</p>}
                   {s.location && <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-2"><MapPin className="w-3 h-3" /> {s.location}</p>}
                 </div>
                 <div className={cn(
                    "absolute bottom-0 right-0 p-6 flex gap-1",
                    selectedServiceId === s.id ? "opacity-100" : "opacity-0"
                 )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                 </div>
               </button>
             ))}
           </div>
        </div>

        {/* 
         * Right: Detailed Roster Form
         */}
        <div className="lg:col-span-6 space-y-8 print-hidden">
           {!selectedServiceId ? (
              <div className="flex h-[600px] items-center justify-center rounded-[3rem] border-2 border-dashed border-ui-border bg-ui-surface/50">
                 <p className="font-medium text-ui-text-secondary">Select a service to build the operational line-up.</p>
              </div>
           ) : (
              <div className="cg-card overflow-hidden p-0 animate-in zoom-in-95 fade-in duration-300 ease-cg">
                <div className="flex items-center justify-between border-b border-ui-border/70 bg-ui-bg-alt p-8">
                   <h3 className="text-2xl">Roster: <span className="text-accent-on-surface">{selectedService?.title}</span></h3>
                   <button 
                    onClick={handlePrePopulate}
                    className="text-[10px] font-bold text-sage uppercase tracking-widest hover:text-accent-on-surface transition-colors flex items-center gap-2"
                   >
                     <Plus className="w-4 h-4" />
                     Add Standard Roles
                   </button>
                </div>
                
                <div className="p-10 space-y-6">
                   {selectedService?.assignments.map((assignment, index) => (
                     <div key={index} className="grid grid-cols-12 gap-8 items-center bg-ui-bg-alt/50 p-4 rounded-2xl group border border-transparent hover:border-ui-border transition-all hover:shadow-sm">
                        <div className="col-span-4">
                           <input 
                            type="text"
                            placeholder="Role Name (e.g. Lead Car)"
                            value={assignment.roleName}
                            onChange={(e) => updateAssignment(index, 'roleName', e.target.value)}
                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-sage uppercase tracking-widest focus:ring-0 placeholder:text-sage/60"
                           />
                        </div>
                        <div className="col-span-7">
                           <select 
                            value={assignment.staffName}
                            onChange={(e) => updateAssignment(index, 'staffName', e.target.value)}
                            className="w-full bg-ui-surface border border-ui-border rounded-xl px-4 py-2 text-sm font-semibold text-ui-text-secondary shadow-xs focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
                           >
                              <option value="">-- Click to assign staff --</option>
                              {MOCK_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                           </select>
                        </div>
                        <div className="col-span-1 flex justify-end">
                           <button 
                            onClick={() => removeAssignment(index)}
                            className="p-2 text-slate-200 hover:text-status-error transition-colors opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   ))}

                   <button 
                    onClick={addAssignment}
                    className="w-full py-6 rounded-2xl border-2 border-dashed border-ui-border text-sage hover:border-brand-500/20 hover:text-brand-500 hover:bg-brand-50/50 transition-all flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest"
                   >
                     <Plus className="w-5 h-5" />
                     Add New Assignment
                   </button>
                </div>
              </div>
           )}
        </div>
      </div>

      {/* 
       * HIGH-FIDELITY PRINT ROSTER 
       */}
      <div className="print-only hidden w-full">
        {/* Sized for Letter at 0.5in margins. The old header used display type
          * that overflowed the page box and pushed the date off the sheet. */}
        <div className="mb-10 border-b-4 border-black pb-6">
          <Image
            src="/2026-CG-Branding-optomized.png"
            alt="The Caring Group"
            width={220}
            height={55}
            className="mb-6 brightness-0"
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="font-sans text-2xl font-semibold uppercase tracking-tight text-black">
              Operational roster
            </h2>
            {/* `date` is a calendar key. Parsing it bare makes it UTC midnight,
              * which renders as the previous day west of Greenwich — the sheet
              * was printing a day early. formatDate pins locale and time zone. */}
            <p className="font-sans text-xl font-semibold text-black">{formatDate(date)}</p>
          </div>
        </div>

        {services.map((s, i) => (
          <div key={s.id} className="mb-8 print-break-inside-avoid">
             <div className="mb-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-lg font-bold text-white">{i+1}</div>
                <div className="min-w-0">
                   <h3 className="font-sans text-lg font-semibold uppercase text-black">{s.title}</h3>
                   <div className="mt-0.5 flex flex-wrap gap-x-4 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                      {s.time && <span>{s.time}</span>}
                      {s.location && <span>{s.location}</span>}
                   </div>
                </div>
             </div>
             {s.assignments.length === 0 ? (
               <p className="pl-14 text-sm italic text-neutral-600">No roster was built for this service.</p>
             ) : (
             <div className="grid grid-cols-2 gap-x-10 gap-y-2 pl-14">
                {s.assignments.map((a, idx) => (
                  <div key={idx} className="flex items-end justify-between gap-3 border-b border-neutral-300 pb-1.5">
                     <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-600">{a.roleName}</span>
                     <span className="text-base font-semibold text-black">{a.staffName || "—"}</span>
                  </div>
                ))}
             </div>
             )}
          </div>
        ))}

        {notes && (
          <div className="mt-8 break-inside-avoid border-l-4 border-black pl-5">
             <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-600">
               Directives for the day
             </p>
             <p className="whitespace-pre-wrap text-sm leading-relaxed text-black">{notes}</p>
          </div>
        )}

        {services.length === 0 && (
          <p className="text-sm italic text-neutral-600">
            No services were scheduled for this date.
          </p>
        )}
      </div>
    </div>
  );
}
