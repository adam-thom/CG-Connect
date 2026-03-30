"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  Activity, 
  AlertTriangle, 
  Send,
  Save,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Minimal forms for each type to demonstrate the UI differences mapped to the 5 forms
export default function NewSubmissionPage({ params }: { params: { type: string } }) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission flow
    router.push("/employee/submissions");
  };

  const renderTimesheetForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
          <input type="date" className="w-full border border-slate-200 rounded-lg p-3 bg-white" required defaultValue="2026-10-02" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Lunch Duration (Hours)</label>
          <input type="number" step="0.5" className="w-full border border-slate-200 rounded-lg p-3 bg-white" defaultValue="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
          <input type="time" className="w-full border border-slate-200 rounded-lg p-3 bg-white" required defaultValue="08:00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
          <input type="time" className="w-full border border-slate-200 rounded-lg p-3 bg-white" required defaultValue="16:30" />
        </div>
      </div>
      <div className="bg-brand-50 p-6 rounded-xl border border-brand-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 uppercase tracking-widest mb-1">Calculated Duration</p>
          <p className="text-4xl font-bold text-brand-900">7.5 <span className="text-xl font-medium text-brand-700">Hours</span></p>
        </div>
        <Clock className="w-12 h-12 text-brand-200" />
      </div>
    </div>
  );

  const renderTransferForm = () => (
    <div className="space-y-6 relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mx-10 pointer-events-none"></div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Decedent Name</label>
        <input type="text" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="First Last" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Pick-up Location</label>
        <input type="text" className="w-full border border-slate-200 rounded-lg p-3 bg-white relative z-10" placeholder="Hospital, Residence, etc." required />
      </div>
      
      <div className="grid grid-cols-2 gap-6 p-6 border border-slate-200 rounded-xl bg-slate-50 relative z-10">
        <h3 className="col-span-full font-bold text-brand-900 flex items-center gap-2 mb-2">
          Medical Examiner Protocol
        </h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">M.E. Case Number</label>
          <input type="text" className="w-full border border-slate-200 rounded-lg p-3 bg-white" placeholder="Required if M.E. involved" />
        </div>
        <div></div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Odometer Start</label>
          <input type="number" className="w-full border border-slate-200 rounded-lg p-3 bg-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Odometer End</label>
          <input type="number" className="w-full border border-slate-200 rounded-lg p-3 bg-white" required />
        </div>
      </div>
    </div>
  );

  const renderIncidentForm = () => (
    <div className="space-y-8">
      <div className="bg-red-50 p-6 rounded-xl border border-red-200">
        <h3 className="text-red-900 font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Severity Rating
        </h3>
        <div className="flex gap-4 mt-4">
          <label className="flex-1 cursor-pointer">
            <input type="radio" name="severity" className="peer sr-only" value="minor" />
            <div className="text-center p-3 rounded-lg border-2 border-slate-200 bg-white peer-checked:border-yellow-500 peer-checked:bg-yellow-50 text-slate-600 peer-checked:text-yellow-800 font-semibold transition-all">Minor</div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input type="radio" name="severity" className="peer sr-only" value="moderate" defaultChecked />
            <div className="text-center p-3 rounded-lg border-2 border-slate-200 bg-white peer-checked:border-orange-500 peer-checked:bg-orange-50 text-slate-600 peer-checked:text-orange-800 font-semibold transition-all">Moderate</div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input type="radio" name="severity" className="peer sr-only" value="critical" />
            <div className="text-center p-3 rounded-lg border-2 border-slate-200 bg-white peer-checked:border-red-500 peer-checked:bg-red-50 text-slate-600 peer-checked:text-red-800 font-semibold transition-all">Critical</div>
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Incident Narrative Context</label>
        <textarea className="w-full border border-slate-200 rounded-lg p-4 bg-white" rows={4} placeholder="Describe exactly what occurred..." required></textarea>
      </div>

      <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
        <span className="text-brand-600 font-medium text-sm">Click to upload photo evidence (JPG/PNG)</span>
      </div>

      <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
        <input type="checkbox" id="certify" className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer" required />
        <label htmlFor="certify" className="text-sm text-slate-600 cursor-pointer">
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
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">{getTitle()}</h1>
        <p className="text-slate-500 mt-2 text-lg">Complete all required fields below to submit.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8">
          {getFormContent()}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button type="button" className="text-slate-500 font-medium px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button type="button" className="flex items-center gap-2 text-slate-700 font-medium px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button type="submit" className="flex items-center gap-2 text-white font-medium px-6 py-2 bg-brand-900 rounded-lg hover:bg-brand-800 transition-colors shadow-sm">
              <Send className="w-4 h-4" /> Submit Record
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
