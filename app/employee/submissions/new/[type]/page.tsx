"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState, use, useEffect, useActionState } from "react";
import { submitFormAction } from "@/app/actions/submissions";
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

  useEffect(() => {
    if (state.success) {
      router.push("/employee/submissions");
    }
  }, [state.success, router]);

  if (!user) return null;

  const renderTimesheetForm = () => (
    <div className="space-y-6 relative">
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
        <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
          <Clock className="w-5 h-5 shrink-0" />
          <span><strong>Note:</strong> Pay period cutoff is 4 days before the 15th and last day of each month.</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Location Manager Assignment</label>
          <select name="location" className="w-full border border-slate-200 rounded-lg p-3 bg-white font-medium text-slate-700 cursor-pointer">
            <option value="">-- Select Target Location Hierarchy --</option>
            <option value="MB">Location Manager - MB</option>
            <option value="CSG">Location Manager - CSG</option>
            <option value="EVG">Location Manager - EVG</option>
            <option value="EDENS">Location Manager - EDENS</option>
          </select>
        </div>
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

  const renderTransferForm = () => (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-2 gap-6 relative z-10">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
          <input type="date" name="date" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
          <input type="time" name="time" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
      </div>

      <div className="relative z-10">
        <label className="block text-sm font-medium text-slate-700 mb-2">Transfer Team</label>
        <input type="text" name="team" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="Name(s) of personnel involved" />
      </div>

      <div className="relative z-10">
        <label className="block text-sm font-medium text-slate-700 mb-2">Type of Transfer</label>
        <select 
          name="transferType" 
          value={transferType}
          onChange={(e) => setTransferType(e.target.value)}
          className="w-full border-2 border-brand-200 rounded-lg p-3 bg-brand-50 font-bold text-brand-900 cursor-pointer focus:ring-2 focus:ring-brand-500" 
        >
          <option value="Standard">Standard Transfer</option>
          <option value="M.E.">M.E. (Medical Examiner) Transfer</option>
          <option value="Non-M.E. Police">Non-M.E. Police Transfer</option>
        </select>
        <p className="text-xs text-brand-700 mt-2">All Transfer Records route directly to TRANSFER MANAGER.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-10">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Name of Deceased</label>
          <input type="text" name="deceasedName" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="Full legal name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Place of Death</label>
          <input type="text" name="placeOfDeath" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="Specific hospital, address, etc." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Next of Kin Name</label>
          <input type="text" name="nokName" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">NOK Relationship</label>
          <input type="text" name="nokRelation" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">NOK Contact #</label>
          <input type="tel" name="nokContact" className="w-full border border-slate-200 rounded-lg p-3 bg-white" />
        </div>
      </div>

      {(transferType === "M.E." || transferType === "Non-M.E. Police") && (
        <div className="p-6 border-2 border-slate-200 rounded-xl bg-slate-50 relative z-10 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">Constabulary Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cons't Name</label>
              <input type="text" name="constName" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="Officer Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cons't Number</label>
              <input type="text" name="constNumber" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="Badge/ID Number" />
            </div>
          </div>
        </div>
      )}

      {transferType === "M.E." && (
        <div className="p-6 border-2 border-brand-200 rounded-xl bg-brand-50/50 relative z-10 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <h3 className="font-bold text-brand-900 flex items-center gap-2">M.E. Protocol Requirements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name of Medical Examiner</label>
              <input type="text" name="meName" className="w-full border border-brand-200 rounded-lg p-3 bg-white focus:ring-brand-500" placeholder="Authorizing M.E." />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Two Transfer Staff Approved?</label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="twoStaffApproved" value="Yes" className="w-5 h-5 text-brand-600 border-slate-300 focus:ring-brand-500" />
                  <span className="text-base font-medium text-slate-800">Yes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="twoStaffApproved" value="No" className="w-5 h-5 text-brand-600 border-slate-300 focus:ring-brand-500" />
                  <span className="text-base font-medium text-slate-800">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
        <textarea name="notes" className="w-full border border-slate-200 rounded-lg p-4 bg-white min-h-[100px]" placeholder="Any additional narrative context..."></textarea>
      </div>
    </div>
  );

  const renderIncidentForm = () => (
    <div className="space-y-6 relative">
      <div className="bg-red-50/50 border border-red-100 rounded-xl p-6 mb-8 text-center">
         <h3 className="text-red-800 font-bold mb-1 flex justify-center items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Mandatory Routing
         </h3>
         <p className="text-sm text-red-700 font-medium">All incident reports automatically deploy alerts to the assigned OHS MANAGER.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Location Manager Assignment</label>
        <select name="location" className="w-full border border-slate-200 rounded-lg p-3 bg-white font-medium text-slate-700 cursor-pointer">
          <option value="">-- Coordinate with Location --</option>
          <option value="MB">Location Manager - MB</option>
          <option value="CSG">Location Manager - CSG</option>
          <option value="EVG">Location Manager - EVG</option>
          <option value="EDENS">Location Manager - EDENS</option>
        </select>
      </div>

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

  const getTitle = () => {
    switch(params.type) {
      case "timesheet": return "Submit Timesheet";
      case "transfer": return "Log Transfer Record";
      case "incident": return "File Incident Report";
      default: return `Submit ${params.type}`;
    }
  };

  const getFormContent = () => {
    switch(params.type) {
      case "timesheet": return renderTimesheetForm();
      case "transfer": return renderTransferForm();
      case "incident": return renderIncidentForm();
      default: return <p className="text-slate-500">Generic form for {params.type}</p>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">{getTitle()}</h1>
        <p className="text-slate-500 mt-2 text-lg">Complete any applicable fields below to submit to management.</p>
      </div>

      <form action={formAction} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {state.error && (
            <div className="bg-red-50 p-4 border-b border-red-200 text-red-600 text-sm font-bold">
               {state.error}
            </div>
        )}
        
        <div className="p-6 md:p-10">
          {getFormContent()}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button type="button" onClick={() => router.back()} disabled={isPending} className="text-slate-500 font-semibold px-5 py-2.5 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={isPending} className="flex items-center gap-2 text-white font-semibold px-8 py-3 bg-brand-900 rounded-xl hover:bg-brand-800 transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-150 disabled:opacity-50">
              <Send className="w-5 h-5" /> {isPending ? "Submitting securely..." : "Submit Record"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
