"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import { FileText, Download, UploadCloud, Trash2, HardDrive, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { cn } from "@/lib/utils";

export default function ManagerDocuments() {
  const { user } = useAuth();
  const [docs, setDocs] = useState(MOCK_DOCUMENTS);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Document Manager</h1>
          <p className="text-slate-500 mt-2 text-lg">Central repository for operational files and handbooks.</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-accent-600 hover:bg-accent-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
        >
          <UploadCloud className="w-5 h-5" /> Upload File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-brand-600" /> Storage
              </h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-brand-900">84.2 GB</span>
                <span className="text-slate-500">100 GB</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full w-[84%]"></div>
              </div>
              <p className="text-xs text-slate-500 text-center pt-2">84% Capacity Used</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center">
               <button className="text-xs font-semibold text-brand-600 hover:text-brand-800">Request Limit Increase</button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2">
            {['All Files', 'Shared via Link', 'Archived'].map((tab, i) => (
              <button 
                key={tab} 
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  i === 0 ? "bg-white text-brand-900 shadow-sm ring-1 ring-slate-200 rounded-lg" : "text-slate-600 hover:bg-slate-200/50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Modified</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-brand-900 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-brand-400 group-hover:text-brand-600 transition-colors" />
                    {doc.name}
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-semibold text-slate-500">{doc.type}</td>
                  <td className="px-6 py-4">{(doc.sizeBytes / 1000000).toFixed(1)} MB</td>
                  <td className="px-6 py-4">{new Date(doc.modifiedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors" title="Replace File">
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDocs(docs.filter(d => d.id !== doc.id))}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" 
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Document">
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 hover:border-brand-400 transition-all cursor-pointer">
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-bold text-brand-900 mb-1">Click to browse or drag file here</h3>
            <p className="text-sm text-slate-500">Supports PDF, DOCX, XLSX (Max 100MB)</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Sharing Level</label>
            <select className="w-full border border-slate-200 rounded-lg p-3 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm">
              <option value="all">Company-Wide (All Employees)</option>
              <option value="managers">Management Only</option>
              <option value="specific">Specific Department</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setIsUploadOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button onClick={() => setIsUploadOpen(false)} className="bg-brand-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-800 transition-colors shadow-sm">
              Upload to Vault
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
