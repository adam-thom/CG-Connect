"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState, use, useEffect, useActionState, useRef } from "react";
import { submitFormAction } from "@/app/actions/submissions";
import { fetchFuneralDirectors } from "@/app/actions/users";
import { saveTransferDraft, getTransferDraft } from "@/app/actions/drafts";
import { 
  Clock, 
  Activity, 
  AlertTriangle, 
  Send
} from "lucide-react";

const initialState = { error: "", success: false };

export default function NewSubmissionPage(props: { params: Promise<{ type: string }> }) {
  const params = use(props.params);
  const { user } = useAuth();
  const router = useRouter();

  // Next.js 15 React Actions Integration
  const boundSubmitAction = submitFormAction.bind(null, params.type);
  const [state, formAction, isPending] = useActionState(boundSubmitAction, initialState);

  const [transferType, setTransferType] = useState<string>("Standard");
  const [hasTransferTime, setHasTransferTime] = useState<boolean>(false);
  const [funeralDirectors, setFuneralDirectors] = useState<{id: string, name: string | null}[]>([]);
  const [snowRemovalRequired, setSnowRemovalRequired] = useState<boolean>(false);

  useEffect(() => {
    fetchFuneralDirectors().then(setFuneralDirectors);
  }, []);

  useEffect(() => {
    if (state.success) {
      if (user?.role === 'manager' || user?.role === 'admin') {
        router.push("/manager/dashboard");
      } else {
        router.push("/employee/submissions");
      }
    }
  }, [state.success, router]);

  const formRef = useRef<HTMLFormElement>(null);
  const [draftExists, setDraftExists] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");

  useEffect(() => {
    if (params.type === 'transfer') {
      getTransferDraft().then(d => {
        if (d) setDraftExists(true);
      });
    }
  }, [params.type]);

  const handleReviewDraft = async () => {
    const d = await getTransferDraft();
    if (d) {
      if (d.transferType) setTransferType(d.transferType);
      
      setTimeout(() => {
        if (!formRef.current) return;
        const elements = formRef.current.elements as HTMLFormControlsCollection;
        for (const [key, val] of Object.entries(d)) {
          const el = elements.namedItem(key) as any;
          if (!el) continue;
          if (el instanceof RadioNodeList) {
             for(let i=0; i<el.length; i++) {
               if((el[i] as HTMLInputElement).value === val) (el[i] as HTMLInputElement).checked = true;
             }
          } else if (el.type === 'radio' || el.type === 'checkbox') {
             el.checked = (val === el.value || val === 'Yes' || val === true);
          } else {
            el.value = val;
          }
        }
      }, 50); // slight delay for transferType select state mapping
    }
  };

  const handleSaveDraft = async () => {
    if (draftExists) {
      if (!window.confirm("Saving this draft will replace your previous draft. Are you sure you want to save?")) return;
    }
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    
    setDraftStatus("Saving draft...");
    const res = await saveTransferDraft(formData);
    if (res?.success) {
      setDraftStatus("Draft saved!");
      setDraftExists(true);
      setTimeout(() => setDraftStatus(""), 3000);
    } else {
      setDraftStatus("Error saving draft.");
      setTimeout(() => setDraftStatus(""), 3000);
    }
  };

  if (!user) return null;

  const userTagNames = user?.tags?.map((t: any) => t.name.toUpperCase()) || user?.assignedRoles?.map((r: string) => r.toUpperCase()) || [];
  const requiresLocationSelect = userTagNames.includes("PART TIME EMPLOYEE");

  const renderTimesheetForm = () => (
    <div className="space-y-6 relative">
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
        <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
          <Clock className="w-5 h-5 shrink-0" />
          <span><strong>Note:</strong> Pay period cutoff is 4 days before the 15th and last day of each month.</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
        {requiresLocationSelect && (
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Location Manager Assignment</label>
            <select name="location" required={requiresLocationSelect} className="w-full border border-slate-200 rounded-lg p-3 bg-white font-medium text-slate-700 cursor-pointer">
              <option value="">-- Select Target Location Hierarchy --</option>
              <option value="MB">Location Manager - MB</option>
              <option value="CSG">Location Manager - CSG</option>
              <option value="EVG">Location Manager - EVG</option>
              <option value="EDENS">Location Manager - EDENS</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
          <input type="date" name="date" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
        <div className="hidden sm:block"></div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Time In</label>
          <input type="time" name="timeIn" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Time Out</label>
          <input type="time" name="timeOut" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Lunch Hour (Duration)</label>
          <input type="number" step="0.5" name="lunch" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="e.g. 1.0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Over Time Hours</label>
          <input type="number" step="0.5" name="ot" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="e.g. 0.0" />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-900 mb-2 flex items-center justify-between">
            Transfer Time (Hours)
          </label>
          <input 
            type="number" 
            step="0.5" 
            name="transferTime" 
            className="w-full border border-brand-200 rounded-lg p-3 bg-brand-50 font-medium text-brand-900" 
            placeholder="e.g. 2.0" 
            onChange={(e) => setHasTransferTime(parseFloat(e.target.value) > 0)}
          />
          <p className="text-xs text-brand-600 mt-1 font-medium italic">If entered, copy is routed to Transfer Manager.</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Total Hours</label>
          <input type="number" step="0.5" name="total" className="w-full border-2 border-slate-300 rounded-lg p-3 bg-slate-50 font-bold" placeholder="Required Calculation" />
        </div>
      </div>
    </div>
  );

  const renderTransferForm = () => {
    const isStandard = transferType === "Standard";
    const isPolice = transferType === "Non-M.E. Police";
    const isME = transferType === "M.E.";
    const isAllTypes = isStandard || isPolice || isME;

    return (
    <div className="space-y-8 relative">
      {/* Top Header Block: ALL TYPES */}
      {isAllTypes && (
        <div className="p-6 md:p-8 border border-slate-200 rounded-2xl bg-white relative z-10 space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-2">
            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-black">1</span>
              Call Details
            </h3>
            <div className="w-full md:w-auto">
              <select 
                name="transferType" 
                value={transferType}
                onChange={(e) => setTransferType(e.target.value)}
                className="w-full md:w-64 border-2 border-brand-300 rounded-lg p-2.5 bg-brand-50 font-bold text-brand-900 cursor-pointer focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm" 
              >
                <option value="Standard">Standard Transfer</option>
                <option value="M.E.">M.E. Transfer</option>
                <option value="Non-M.E. Police">Non-M.E. Police Transfer</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
              <input type="date" name="date" required className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Time of Call *</label>
              <input type="time" name="time" required className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Person Calling</label>
              <input type="text" name="callerName" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone #</label>
              <input type="tel" name="callerPhone" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Funeral Home *</label>
              <select name="funeralHome" required className="w-full border border-slate-200 rounded-lg p-3 bg-white">
                <option value="">-- Select --</option>
                <option value="MB">MB</option>
                <option value="CSG">CSG</option>
                <option value="EVG">EVG</option>
                <option value="EDENS CD">EDENS CD</option>
                <option value="EDENS PC">EDENS PC</option>
                <option value="EDENS FM">EDENS FM</option>
              </select>
            </div>
            
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Funeral Director Assigning Transfer *</label>
              <select name="funeralDirectorAssigning" required className="w-full border border-slate-200 rounded-lg p-3 bg-white">
                <option value="">-- Select --</option>
                {funeralDirectors.map(fd => (
                   <option key={fd.id} value={fd.name || ''}>{fd.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Transfer Team *</label>
              <input type="text" name="team" required className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="Name(s) of personnel involved" />
            </div>
            
            <div className="col-span-1 lg:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Where to take the body *</label>
              <textarea name="destination" required className="w-full border border-slate-200 rounded-lg p-3 bg-white"></textarea>
            </div>
          </div>
        </div>
      )}

      {/* Deceased Info Block: ALL TYPES */}
      {isAllTypes && (
        <div className="p-6 md:p-8 border border-slate-200 rounded-2xl bg-white relative z-10 space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4">
             <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black">2</span>
             Deceased Details
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name of Deceased *</label>
              <input type="text" name="deceasedName" required className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Place of Death *</label>
              <textarea name="placeOfDeath" required className="w-full border border-slate-200 rounded-lg p-3 bg-white"></textarea>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 mt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
              <input type="text" name="deceasedAge" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sex</label>
              <input type="text" name="deceasedSex" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">D.O.B</label>
              <input type="date" name="deceasedDob" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">D.O.D *</label>
              <input type="date" name="deceasedDod" required className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
          </div>
        </div>
      )}

      {/* Grid for Valuables & NOK side-by-side if both present, or full width if not */}
      <div className={`grid gap-6 animate-in fade-in slide-in-from-bottom-2 ${((isStandard || isME) && (isPolice || isME)) ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Valuables Block: Standard and M.E. */}
        {(isStandard || isME) && (
          <div className="p-6 md:p-8 border border-green-200 rounded-2xl bg-[#f0fdf4] relative z-10 space-y-4 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-lg text-green-900 flex items-center gap-2">
              Valuables
            </h3>
            <div className="flex-1 min-h-[150px] relative">
              <label className="block text-sm font-medium text-green-800 mb-2">Valuables/Item(s) Description *</label>
              <textarea name="valuables" required className="w-full border border-green-200 rounded-lg p-4 bg-white min-h-[100px] focus:ring-green-500"></textarea>
            </div>
          </div>
        )}

        {/* N.O.K Block: Police and M.E. */}
        <div className="space-y-6 flex flex-col">
          {(isPolice || isME) && (
            <div className="p-6 md:p-8 border border-blue-200 rounded-2xl bg-[#eff6ff] relative z-10 space-y-6 shadow-sm flex-1">
              <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">Next of Kin</h3>
              <div className="grid grid-cols-1 gap-y-5">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">N.O.K Name</label>
                  <input type="text" name="nokName" className="w-full border border-blue-200 rounded-lg p-3 bg-white focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">N.O.K Phone #</label>
                  <input type="tel" name="nokContact" className="w-full border border-blue-200 rounded-lg p-3 bg-white focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">Relationship to deceased</label>
                  <input type="text" name="nokRelation" className="w-full border border-blue-200 rounded-lg p-3 bg-white focus:ring-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* Special Instructions: M.E. Only */}
          {isME && (
            <div className="p-6 border border-slate-300 rounded-2xl bg-white relative z-10 shadow-sm">
              <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions & Conditions of Remains</label>
              <textarea name="specialInstructions" className="w-full border border-slate-200 rounded-lg p-4 bg-white min-h-[100px]"></textarea>
            </div>
          )}
        </div>
      </div>

      {/* Constabulary details bottom & Medical Examiner details */}
      {isME ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-6 md:p-8 border border-slate-300 rounded-2xl bg-slate-50 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800">Medical Examiner info</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">MEDICAL EXAMINER NAME</label>
              <input type="text" name="medicalExaminerName" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">DATE TO BE BROUGHT TO M.E.</label>
              <input type="date" name="dateToME" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
          </div>
          
          <div className="p-6 md:p-8 border border-blue-200 rounded-2xl bg-[#eff6ff] shadow-sm space-y-6 flex flex-col justify-center">
            <h3 className="font-bold text-lg text-blue-900">Constabulary (Scene)</h3>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">CONS'T NAME</label>
              <input type="text" name="constName" className="w-full border border-blue-200 rounded-lg p-3 bg-white focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">CONS'T NUMBER</label>
              <input type="text" name="constNumber" className="w-full border border-blue-200 rounded-lg p-3 bg-white focus:ring-blue-500" />
            </div>
          </div>
        </div>
      ) : isPolice ? (
        <div className="animate-in fade-in slide-in-from-bottom-2">
           <div className="p-6 md:p-8 border border-blue-200 rounded-2xl bg-[#eff6ff] shadow-sm space-y-6 lg:w-1/2">
            <h3 className="font-bold text-lg text-blue-900">Constabulary (Scene)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">CONS'T NAME</label>
                <input type="text" name="constName" className="w-full border border-blue-200 rounded-lg p-3 bg-white focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">CONS'T NUMBER</label>
                <input type="text" name="constNumber" className="w-full border border-blue-200 rounded-lg p-3 bg-white focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Transport Stats: M.E. only */}
      {isME && (
        <div className="p-6 md:p-8 border border-slate-300 rounded-2xl bg-slate-50 relative z-10 space-y-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-4">
            <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            Transport Timing & Mileage
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Left FH</label>
              <input type="time" name="timeLeftMB" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Arrive @ Scene</label>
              <input type="time" name="arriveScene" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Depart From Scene</label>
              <input type="time" name="departScene" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Return to FH</label>
              <input type="time" name="arriveHospital" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-6 border-t border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mileage out</label>
              <input type="number" name="mileageOut" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mileage Return</label>
              <input type="number" name="mileageReturn" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Mileage</label>
              <input type="number" name="totalMileage" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
            </div>
          </div>
        </div>
      )}



      {/* Internal tracking context wrapper, no boxes outside it */}
      <div className="pt-10 space-y-6 opacity-75 hover:opacity-100 transition-opacity">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">CG Connect Tracking Details</h4>
        
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide">Two Transfer Staff Approved?</label>
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="twoStaffApproved" value="Yes" className="w-5 h-5 text-brand-600 border-slate-300 focus:ring-brand-500" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Yes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="twoStaffApproved" value="No" className="w-5 h-5 text-brand-600 border-slate-300 focus:ring-brand-500" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm mt-4">
          <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Internal Notes</label>
          <textarea name="notes" className="w-full border border-slate-200 rounded-lg p-4 bg-white min-h-[100px]"></textarea>
        </div>
      </div>
    </div>
    );
  };

  const renderIncidentForm = () => (
    <div className="space-y-6 relative">
      <div className="bg-red-50/50 border border-red-100 rounded-xl p-6 mb-8 text-center">
         <h3 className="text-red-800 font-bold mb-1 flex justify-center items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Mandatory Routing
         </h3>
         <p className="text-sm text-red-700 font-medium">All incident reports automatically deploy alerts to the assigned OHS MANAGER.</p>
      </div>

      {requiresLocationSelect && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Location Manager Assignment</label>
          <select name="location" required={requiresLocationSelect} className="w-full border border-slate-200 rounded-lg p-3 bg-white font-medium text-slate-700 cursor-pointer">
            <option value="">-- Coordinate with Location --</option>
            <option value="MB">Location Manager - MB</option>
            <option value="CSG">Location Manager - CSG</option>
            <option value="EVG">Location Manager - EVG</option>
            <option value="EDENS">Location Manager - EDENS</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date and Time of Incident</label>
          <input type="datetime-local" name="incidentDate" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Location of Incident</label>
          <input type="text" name="incidentLocation" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="Address, Room, or Vehicle Designation" />
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
           Nature of Incident
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <label className="w-full cursor-pointer hover:-translate-y-1 transition-transform">
            <input type="radio" name="nature" className="peer sr-only" value="Injury" />
            <div className="h-full flex items-center justify-center p-4 rounded-xl border-2 border-slate-200 bg-white peer-checked:border-red-500 peer-checked:bg-red-50 text-slate-600 peer-checked:text-red-800 font-bold transition-all shadow-sm">INJURY</div>
          </label>
          <label className="w-full cursor-pointer hover:-translate-y-1 transition-transform">
            <input type="radio" name="nature" className="peer sr-only" value="Damage" />
            <div className="h-full flex items-center justify-center p-4 rounded-xl border-2 border-slate-200 bg-white peer-checked:border-orange-500 peer-checked:bg-orange-50 text-slate-600 peer-checked:text-orange-800 font-bold transition-all shadow-sm">DAMAGE</div>
          </label>
          <label className="w-full cursor-pointer hover:-translate-y-1 transition-transform">
            <input type="radio" name="nature" className="peer sr-only" value="Legal" />
            <div className="h-full flex items-center justify-center p-4 rounded-xl border-2 border-slate-200 bg-white peer-checked:border-purple-500 peer-checked:bg-purple-50 text-slate-600 peer-checked:text-purple-800 font-bold transition-all shadow-sm">LEGAL</div>
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Incident Narrative & Notes</label>
        <textarea name="notes" className="w-full border border-slate-200 rounded-lg p-4 bg-white" rows={6} placeholder="Describe exactly what occurred in absolute objective detail..."></textarea>
      </div>

      <div className="flex items-start gap-4 pt-6 border-t border-slate-100">
        <input type="checkbox" name="certified" id="certify" className="mt-1 w-5 h-5 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer" />
        <label htmlFor="certify" className="text-sm text-slate-700 font-medium leading-relaxed max-w-2xl cursor-pointer">
          I certify that the information provided is truthful and accurate to the best of my knowledge. Submitting false reports is a violation of the Stewardship & Ethics Handbook.
        </label>
      </div>
    </div>
  );

  const renderTimeOffForm = () => (
    <div className="space-y-6 relative">
      <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-6 mb-8 text-center">
         <h3 className="text-brand-800 font-bold mb-1 flex justify-center items-center gap-2">
            <Clock className="w-5 h-5" /> Request Time Off
         </h3>
         <p className="text-sm text-brand-700 font-medium">Managers will be instantly notified to authorize this schedule blockage.</p>
      </div>

      {requiresLocationSelect && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Location Manager Assignment</label>
          <select name="location" className="w-full border border-slate-200 rounded-lg p-3 bg-white font-medium text-slate-700 cursor-pointer" required={requiresLocationSelect}>
            <option value="">-- Coordinate with Location --</option>
            <option value="MB">Location Manager - MB</option>
            <option value="CSG">Location Manager - CSG</option>
            <option value="EVG">Location Manager - EVG</option>
            <option value="EDENS">Location Manager - EDENS</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 w-full mt-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
          <input type="date" name="startDate" className="w-full border border-slate-200 rounded-lg p-3 bg-white focus:ring-2 focus:ring-brand-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Inclusive)</label>
          <input type="date" name="endDate" className="w-full border border-slate-200 rounded-lg p-3 bg-white focus:ring-2 focus:ring-brand-500" required />
        </div>
      </div>

      <div className="relative z-10">
        <label className="block text-sm font-medium text-slate-700 mb-2">Reason (Optional)</label>
        <textarea name="reason" className="w-full border border-slate-200 rounded-lg p-4 bg-white min-h-[120px] focus:ring-2 focus:ring-brand-500" placeholder="Vacation, Personal Day, Medical, etc."></textarea>
      </div>
    </div>
  );

  const renderSnowLogForm = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
          <input type="date" name="date" required className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Snow Removal Required?</label>
          <div className="flex items-center gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="snowRemovalRequired" value="Yes" checked={snowRemovalRequired} onChange={() => setSnowRemovalRequired(true)} className="w-5 h-5 text-brand-600 focus:ring-brand-500" />
              <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="snowRemovalRequired" value="No" checked={!snowRemovalRequired} onChange={() => setSnowRemovalRequired(false)} className="w-5 h-5 text-brand-600 focus:ring-brand-500" />
              <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">No</span>
            </label>
          </div>
        </div>
      </div>

      {snowRemovalRequired && (
        <div className="p-6 border border-brand-200 bg-brand-50 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-bold text-brand-900 mb-4 uppercase tracking-wide">Select Actions Taken</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors shadow-sm">
              <input type="checkbox" name="iceSalt" value="Yes" className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
              <span className="font-medium text-slate-700">Ice Salt</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors shadow-sm">
              <input type="checkbox" name="manualShoveling" value="Yes" className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
              <span className="font-medium text-slate-700">Manual Shovelling</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors shadow-sm">
              <input type="checkbox" name="contractedPlow" value="Yes" className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
              <span className="font-medium text-slate-700">Contracted Plow</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors shadow-sm">
              <input type="checkbox" name="iceBreaking" value="Yes" className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
              <span className="font-medium text-slate-700">Ice Breaking</span>
            </label>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
        <textarea name="notes" className="w-full border border-slate-200 rounded-lg p-4 bg-white min-h-[120px] focus:ring-2 focus:ring-brand-500" placeholder="Optional details..."></textarea>
      </div>
    </div>
  );

  const getTitle = () => {
    switch(params.type) {
      case "timesheet": return "Submit Timesheet";
      case "transfer": return "Log Transfer Record";
      case "incident": return "File Incident Report";
      case "time-off": return "Request Time Off";
      case "snow-log": return "Snow Removal Log";
      default: return `Submit ${params.type}`;
    }
  };

  const getFormContent = () => {
    switch(params.type) {
      case "timesheet": return renderTimesheetForm();
      case "transfer": return renderTransferForm();
      case "incident": return renderIncidentForm();
      case "time-off": return renderTimeOffForm();
      case "snow-log": return renderSnowLogForm();
      default: return <p className="text-slate-500">Generic form for {params.type}</p>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">{getTitle()}</h1>
          <p className="text-slate-500 mt-2 text-lg">Complete any applicable fields below to submit to management.</p>
        </div>
        {params.type === 'transfer' && draftExists && (
          <button 
            onClick={handleReviewDraft} 
            className="shrink-0 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-brand-900 font-bold rounded-xl transition-colors border border-slate-300 shadow-sm"
          >
            Review Draft
          </button>
        )}
      </div>

      <form ref={formRef} action={formAction} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {state.error && (
            <div className="bg-red-50 p-4 border-b border-red-200 text-red-600 text-sm font-bold">
               {state.error}
            </div>
        )}
        
        <div className="p-6 md:p-10">
          {getFormContent()}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <button type="button" onClick={() => router.back()} disabled={isPending} className="text-slate-500 font-semibold px-5 py-2.5 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50">
            Cancel
          </button>
          
          <div className="flex items-center gap-4">
            {draftStatus && <span className="text-sm font-bold text-brand-600 animate-pulse">{draftStatus}</span>}
            
            {params.type === 'transfer' && (
              <button 
                type="button" 
                onClick={handleSaveDraft} 
                disabled={isPending} 
                className="flex items-center gap-2 text-brand-900 font-bold px-6 py-3 bg-brand-50 border-2 border-brand-200 rounded-xl hover:bg-brand-100 transition-colors shadow-sm disabled:opacity-50"
              >
                Save Draft
              </button>
            )}

            <button type="submit" disabled={isPending} className="flex items-center gap-2 text-white font-semibold px-8 py-3 bg-brand-900 rounded-xl hover:bg-brand-800 transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-150 disabled:opacity-50">
              <Send className="w-5 h-5" /> {isPending ? "Submitting securely..." : "Submit Record"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
