"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchFuneralDirectors } from "@/app/actions/users";

interface SubmissionFormFieldsProps {
  type: string;
  data: Record<string, any>;
  isEditable: boolean;
  isLocked: boolean;
}

const ReadOnlyField = ({ label, value, isNarrative = false, required }: { label: string; value: any; isNarrative?: boolean; required?: boolean }) => (
  <div className={cn(isNarrative ? "col-span-full" : "")}>
    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
      {label}
    </label>
    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-brand-900 min-h-[50px] font-medium leading-relaxed whitespace-pre-wrap">
      {value == null || value === "" ? "—" : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
    </div>
  </div>
);

const EditField = ({ label, name, type = "text", value, isNarrative = false, onChange, required }: { label: string; name: string; type?: string; value: any; isNarrative?: boolean; onChange?: (e: any) => void; required?: boolean }) => (
  <div className={cn(isNarrative ? "col-span-full" : "")}>
    <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {isNarrative ? (
      <textarea
        name={name}
        className="w-full border border-orange-300 rounded-lg p-3 bg-orange-50 focus:ring-2 focus:ring-brand-500 text-slate-800"
        defaultValue={value || ""}
        rows={4}
        required={required}
      />
    ) : (
      <input
        type={type}
        name={name}
        className="w-full border border-orange-300 rounded-lg p-3 bg-orange-50 focus:ring-2 focus:ring-brand-500 text-slate-800 font-medium"
        defaultValue={value || ""}
        onChange={onChange}
        required={required}
      />
    )}
  </div>
);

export function SubmissionFormFields({ type, data, isEditable, isLocked }: SubmissionFormFieldsProps) {
  // Transfer state for conditional fields
  const [transferType, setTransferType] = useState(data.transferType || "Standard");
  const [funeralDirectors, setFuneralDirectors] = useState<{id: string, name: string | null}[]>([]);
  const [snowRemovalRequired, setSnowRemovalRequired] = useState(data.snowRemovalRequired === 'Yes');

  useEffect(() => {
    if (type === 'transfer') {
      fetchFuneralDirectors().then(setFuneralDirectors);
    }
  }, [type]);

  // Determine which field component to use
  const Field = isEditable && !isLocked ? EditField : ReadOnlyField;

  const renderTimesheet = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
      <Field label="Date" name="date" type="date" value={data.date?.split('T')[0]} />
      <div className="hidden md:block"></div>
      
      <Field label="Time In" name="timeIn" type="time" value={data.timeIn} />
      <Field label="Time Out" name="timeOut" type="time" value={data.timeOut} />
      
      <Field label="Lunch Hour (Duration)" name="lunch" type="number" value={data.lunchHour} />
      <Field label="Over Time Hours" name="ot" type="number" value={data.overTime} />
      
      <Field label="Transfer Time (Hours)" name="transferTime" type="number" value={data.transferTime} />
      <Field label="Total Hours" name="total" type="number" value={data.totalHours} />
    </div>
  );

  const renderTransfer = () => {
    const isStandard = transferType === "Standard";
    const isPolice = transferType === "Non-M.E. Police";
    const isME = transferType === "M.E.";
    const isAllTypes = isStandard || isPolice || isME;

    return (
    <div className="space-y-8">
      {/* Top Header Block: ALL TYPES */}
      {isAllTypes && (
        <div className="p-6 md:p-8 border border-slate-200 rounded-2xl bg-white relative z-10 space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-2">
            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-black">1</span>
              Call Details
            </h3>
            {isEditable && !isLocked ? (
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
            ) : (
              <div className="bg-brand-50 text-brand-800 font-bold px-4 py-2 rounded-lg border border-brand-200 flex items-center gap-2">
                Type: {data.transferType}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
            <div className="col-span-1 lg:col-span-2"><Field label="Date" name="date" type="date" value={data.date?.split('T')[0]} required /></div>
            <div className="col-span-1 lg:col-span-2"><Field label="Time of Call" name="time" type="time" value={data.time} required /></div>
            
            <div className="col-span-1 lg:col-span-2"><Field label="Person Calling" name="callerName" value={data.callerName} required /></div>
            <div className="col-span-1 lg:col-span-2"><Field label="Phone #" name="callerPhone" value={data.callerPhone} required /></div>
            
            <div className="col-span-1 lg:col-span-2">
              {isEditable && !isLocked ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Funeral Home<span className="text-red-500 ml-1">*</span></label>
                  <select name="funeralHome" defaultValue={data.funeralHome || ''} required className="w-full border border-slate-200 rounded-lg p-3 bg-white">
                    <option value="">-- Select --</option>
                    <option value="MB">MB</option>
                    <option value="CSG">CSG</option>
                    <option value="EVG">EVG</option>
                    <option value="EDENS CD">EDENS CD</option>
                    <option value="EDENS PC">EDENS PC</option>
                    <option value="EDENS FM">EDENS FM</option>
                  </select>
                </div>
              ) : (
                <ReadOnlyField label="Funeral Home" value={data.funeralHome} />
              )}
            </div>
            
            <div className="col-span-1 lg:col-span-2">
              {isEditable && !isLocked ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Funeral Director Assigning Transfer<span className="text-red-500 ml-1">*</span></label>
                  <select name="funeralDirectorAssigning" defaultValue={data.funeralDirectorAssigning || ''} required className="w-full border border-slate-200 rounded-lg p-3 bg-white">
                    <option value="">-- Select --</option>
                    {funeralDirectors.map(fd => (
                       <option key={fd.id} value={fd.name || ''}>{fd.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <Field label="Funeral Director Assigning Transfer" name="funeralDirectorAssigning" value={data.funeralDirectorAssigning} />
              )}
            </div>
            
            <div className="col-span-1 lg:col-span-2"><Field label="Transfer Team" name="team" value={data.team} required /></div>
            
            <Field label="Where to take the body" name="destination" value={data.destination} isNarrative required />
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
            <Field label="Name of Deceased" name="deceasedName" value={data.deceasedName} required />
            <Field label="Place of Death" name="placeOfDeath" value={data.placeOfDeath} isNarrative required />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 mt-2">
            <Field label="Age" name="deceasedAge" value={data.deceasedAge} required />
            <Field label="Sex" name="deceasedSex" value={data.deceasedSex} required />
            <Field label="D.O.B" name="deceasedDob" type="date" value={data.deceasedDob?.split('T')[0]} required />
            <Field label="D.O.D" name="deceasedDod" type="date" value={data.deceasedDod?.split('T')[0]} required />
          </div>
        </div>
      )}

      {/* Grid for Valuables & NOK side-by-side if both present, or full width if not */}
      <div className={cn("grid gap-6 animate-in fade-in slide-in-from-bottom-2", ((isStandard || isME) && (isPolice || isME)) ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
        {/* Valuables Block: Standard and M.E. */}
        {(isStandard || isME) && (
          <div className="p-6 md:p-8 border border-green-200 rounded-2xl bg-[#f0fdf4] relative z-10 space-y-4 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-lg text-green-900 flex items-center gap-2">
              Valuables
            </h3>
            <div className="flex-1 min-h-[150px] relative">
              <Field label="Valuables/Item(s) Description" name="valuables" value={data.valuables} isNarrative required />
            </div>
          </div>
        )}

        {/* N.O.K Block: Police and M.E. */}
        <div className="space-y-6 flex flex-col">
          {(isPolice || isME) && (
            <div className="p-6 md:p-8 border border-blue-200 rounded-2xl bg-[#eff6ff] relative z-10 space-y-6 shadow-sm flex-1">
              <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">Next of Kin</h3>
              <div className="grid grid-cols-1 gap-y-5">
                <Field label="N.O.K Name" name="nokName" value={data.nokName} required />
                <Field label="N.O.K Phone #" name="nokContact" value={data.nokContact} required />
                <Field label="Relationship to deceased" name="nokRelation" value={data.nokRelation} required />
              </div>
            </div>
          )}

          {/* Special Instructions: M.E. Only */}
          {isME && (
            <div className="p-6 border border-slate-300 rounded-2xl bg-white relative z-10 shadow-sm">
              <Field label="Special Instructions & Conditions of Remains" name="specialInstructions" value={data.specialInstructions} isNarrative required />
            </div>
          )}
        </div>
      </div>

      {/* Constabulary details bottom & Medical Examiner details */}
      {isME ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-6 md:p-8 border border-slate-300 rounded-2xl bg-slate-50 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800">Medical Examiner info</h3>
            <Field label="MEDICAL EXAMINER NAME" name="medicalExaminerName" value={data.medicalExaminerName} required />
            <Field label="DATE TO BE BROUGHT TO M.E." name="dateToME" type="date" value={data.dateToME?.split('T')[0]} required />
          </div>
          
          <div className="p-6 md:p-8 border border-blue-200 rounded-2xl bg-[#eff6ff] shadow-sm space-y-6 flex flex-col justify-center">
            <h3 className="font-bold text-lg text-blue-900">Constabulary (Scene)</h3>
            <Field label="CONS'T NAME" name="constName" value={data.constName} required />
            <Field label="CONS'T NUMBER" name="constNumber" value={data.constNumber} required />
          </div>
        </div>
      ) : isPolice ? (
        <div className="animate-in fade-in slide-in-from-bottom-2">
           <div className="p-6 md:p-8 border border-blue-200 rounded-2xl bg-[#eff6ff] shadow-sm space-y-6 lg:w-1/2">
            <h3 className="font-bold text-lg text-blue-900">Constabulary (Scene)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="CONS'T NAME" name="constName" value={data.constName} required />
              <Field label="CONS'T NUMBER" name="constNumber" value={data.constNumber} required />
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
            <Field label="Left FH" name="timeLeftMB" value={data.timeLeftMB} type="time" required />
            <Field label="Arrive @ Scene" name="arriveScene" value={data.arriveScene} type="time" required />
            <Field label="Depart From Scene" name="departScene" value={data.departScene} type="time" required />
            <Field label="Return to FH" name="arriveHospital" value={data.arriveHospital} type="time" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-6 border-t border-slate-200">
            <Field label="Mileage out" name="mileageOut" value={data.mileageOut} type="number" required />
            <Field label="Mileage Return" name="mileageReturn" value={data.mileageReturn} type="number" required />
            <Field label="Total Mileage" name="totalMileage" value={data.totalMileage} type="number" required />
          </div>
        </div>
      )}



      {/* Internal tracking context wrapper, no boxes outside it */}
      <div className="pt-10 space-y-6 opacity-75 hover:opacity-100 transition-opacity">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">CG Connect Tracking Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
            {isEditable && !isLocked ? (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide">Two Transfer Staff Approved?<span className="text-red-500 ml-1">*</span></label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="twoStaffApproved" value="Yes" defaultChecked={data.twoStaffApproved === 'Yes'} className="w-5 h-5 text-brand-600 border-slate-300 focus:ring-brand-500" required />
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Yes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="twoStaffApproved" value="No" defaultChecked={data.twoStaffApproved === 'No'} className="w-5 h-5 text-brand-600 border-slate-300 focus:ring-brand-500" required />
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">No</span>
                  </label>
                </div>
              </div>
            ) : (
              <Field label="Two Staff Approved" name="twoStaffApproved" value={data.twoStaffApproved} />
            )}
          </div>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
            <Field label="Transfer Team (Internal)" name="team" value={data.team} required />
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm mt-4">
          <Field label="Internal Notes" name="notes" value={data.notes} isNarrative required />
        </div>
      </div>
    </div>
    );
  };

  const renderIncident = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        <Field label="Date and Time of Incident" name="incidentDate" type="datetime-local" value={data.incidentDate?.substring(0, 16)} />
        <Field label="Location of Incident" name="incidentLocation" value={data.incidentLocation} />
        
        {isEditable && !isLocked ? (
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-bold text-slate-900 mb-3">Nature of Incident</label>
            <div className="grid grid-cols-3 gap-4">
              <label className="w-full cursor-pointer hover:-translate-y-1 transition-transform">
                <input type="radio" name="nature" className="peer sr-only" value="Injury" defaultChecked={data.nature === "Injury"} />
                <div className="h-full flex items-center justify-center p-4 rounded-xl border-2 border-slate-200 bg-white peer-checked:border-red-500 peer-checked:bg-red-50 text-slate-600 peer-checked:text-red-800 font-bold transition-all shadow-sm">INJURY</div>
              </label>
              <label className="w-full cursor-pointer hover:-translate-y-1 transition-transform">
                <input type="radio" name="nature" className="peer sr-only" value="Damage" defaultChecked={data.nature === "Damage"} />
                <div className="h-full flex items-center justify-center p-4 rounded-xl border-2 border-slate-200 bg-white peer-checked:border-orange-500 peer-checked:bg-orange-50 text-slate-600 peer-checked:text-orange-800 font-bold transition-all shadow-sm">DAMAGE</div>
              </label>
              <label className="w-full cursor-pointer hover:-translate-y-1 transition-transform">
                <input type="radio" name="nature" className="peer sr-only" value="Legal" defaultChecked={data.nature === "Legal"} />
                <div className="h-full flex items-center justify-center p-4 rounded-xl border-2 border-slate-200 bg-white peer-checked:border-purple-500 peer-checked:bg-purple-50 text-slate-600 peer-checked:text-purple-800 font-bold transition-all shadow-sm">LEGAL</div>
              </label>
            </div>
          </div>
        ) : (
          <Field label="Nature of Incident" name="nature" value={data.nature} />
        )}
      </div>

      <Field label="Incident Narrative & Notes" name="notes" value={data.notes} isNarrative />

      {isEditable && !isLocked ? (
        <div className="flex items-start gap-4 pt-6 mt-6 border-t border-slate-100">
          <input type="checkbox" name="certified" id="certify" defaultChecked={data.certified === 'Yes'} className="mt-1 w-5 h-5 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer" />
          <label htmlFor="certify" className="text-sm text-slate-700 font-medium leading-relaxed max-w-2xl cursor-pointer">
            I certify that the information provided is truthful and accurate to the best of my knowledge. Submitting false reports is a violation of the Stewardship & Ethics Handbook.
          </label>
        </div>
      ) : (
        <Field label="Certified Accurate" name="certified" value={data.certified} />
      )}
    </div>
  );

  const renderTimeOff = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        <Field label="Start Date" name="startDate" type="date" value={data.startDate?.split('T')[0]} />
        <Field label="End Date" name="endDate" type="date" value={data.endDate?.split('T')[0]} />
      </div>

      <Field label="Reason & Details" name="reason" value={data.reason} isNarrative />
    </div>
  );

  const renderSnowLog = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        <Field label="Date" name="date" type="date" value={data.date?.split('T')[0]} />
        
        {isEditable && !isLocked ? (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Snow Removal Required?</label>
            <div className="flex items-center gap-6 mt-4">
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
        ) : (
          <Field label="Snow Removal Required?" name="snowRemovalRequired" value={data.snowRemovalRequired} />
        )}
      </div>

      {snowRemovalRequired && (
        <div className="p-6 border border-brand-200 bg-brand-50 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-bold text-brand-900 mb-4 uppercase tracking-wide">Select Actions Taken</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isEditable && !isLocked ? (
              <>
                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors shadow-sm">
                  <input type="checkbox" name="iceSalt" value="Yes" defaultChecked={data.iceSalt === 'Yes'} className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
                  <span className="font-medium text-slate-700">Ice Salt</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors shadow-sm">
                  <input type="checkbox" name="manualShoveling" value="Yes" defaultChecked={data.manualShoveling === 'Yes'} className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
                  <span className="font-medium text-slate-700">Manual Shovelling</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors shadow-sm">
                  <input type="checkbox" name="contractedPlow" value="Yes" defaultChecked={data.contractedPlow === 'Yes'} className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
                  <span className="font-medium text-slate-700">Contracted Plow</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors shadow-sm">
                  <input type="checkbox" name="iceBreaking" value="Yes" defaultChecked={data.iceBreaking === 'Yes'} className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
                  <span className="font-medium text-slate-700">Ice Breaking</span>
                </label>
              </>
            ) : (
              <div className="flex flex-wrap gap-2 col-span-2">
                {data.iceSalt === 'Yes' && <span className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-medium shadow-sm">Ice Salt</span>}
                {data.manualShoveling === 'Yes' && <span className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-medium shadow-sm">Manual Shovelling</span>}
                {data.contractedPlow === 'Yes' && <span className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-medium shadow-sm">Contracted Plow</span>}
                {data.iceBreaking === 'Yes' && <span className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-medium shadow-sm">Ice Breaking</span>}
                {!(data.iceSalt === 'Yes' || data.manualShoveling === 'Yes' || data.contractedPlow === 'Yes' || data.iceBreaking === 'Yes') && (
                  <span className="text-slate-500 italic">No specific actions documented</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Field label="Notes" name="notes" value={data.notes} isNarrative />
    </div>
  );

  switch (type) {
    case 'timesheet': return renderTimesheet();
    case 'transfer': return renderTransfer();
    case 'incident': return renderIncident();
    case 'time-off': return renderTimeOff();
    case 'snow-log': return renderSnowLog();
    default: return <p>Unsupported form type.</p>;
  }
}

