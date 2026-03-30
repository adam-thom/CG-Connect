"use client";

import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import { FileText, Download, Eye, AlertCircle, BookOpen, ShieldCheck, HeartHandshake } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function EmployeeDocs() {
  const { user } = useAuth();
  if (!user) return null;

  // Filter docs accessible to all (employees)
  const accessibleDocs = MOCK_DOCUMENTS.filter(d => d.sharedWith === "all");

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Knowledge Archive</h1>
        <p className="text-slate-500 mt-2 text-lg">Company policies, operational guides, and benefits.</p>
      </div>

      {/* Featured Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-brand-900 to-brand-800 rounded-3xl p-8 relative overflow-hidden text-white shadow-lg">
          <div className="absolute -right-16 -top-16 opacity-10">
            <BookOpen className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-sm">
              Featured Resource
            </span>
            <h2 className="text-3xl font-bold mb-3">2026 Stewardship & Ethics Handbook</h2>
            <p className="text-brand-100 max-w-md text-lg leading-relaxed mb-8">
              The updated definitive guide to our standard of care, professional conduct, and operational excellence.
            </p>
            <button className="bg-white text-brand-900 px-6 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors shadow-sm flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download PDF (4.5 MB)
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-accent-300 transition-colors flex items-center gap-4 cursor-pointer">
            <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-accent-600" />
            </div>
            <div>
              <h3 className="font-bold text-brand-900">Safety & Compliance</h3>
              <p className="text-sm text-slate-500 mt-0.5">OSHA logs, MSDA sheets</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-brand-300 transition-colors flex items-center gap-4 cursor-pointer">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center shrink-0">
              <HeartHandshake className="w-7 h-7 text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-brand-900">HR & Benefits</h3>
              <p className="text-sm text-slate-500 mt-0.5">Insurance, PTO policies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Document Library Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-900">Document Vault</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accessibleDocs.map(doc => {
                const isPdf = doc.type === 'pdf';
                return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-900 flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      {doc.name}
                    </td>
                    <td className="px-6 py-4 uppercase text-xs font-semibold text-slate-500">{doc.type}</td>
                    <td className="px-6 py-4">{(doc.sizeBytes / 1000000).toFixed(1)} MB</td>
                    <td className="px-6 py-4">{new Date(doc.modifiedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPdf && (
                          <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition-colors" title="View Document">
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent-600 transition-colors" title="Download">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-orange-900 mb-1">Having trouble finding a document?</h3>
          <p className="text-orange-800 text-sm">Contact human resources at <a href="mailto:hr@caring.com" className="font-semibold underline">hr@caring.com</a> for requests regarding legacy case files prior to 2024.</p>
        </div>
      </div>
    </div>
  );
}
