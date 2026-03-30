"use client";

import { useState } from "react";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import { 
  FileText, Download, Eye, AlertCircle, BookOpen, ShieldCheck, HeartHandshake,
  ChevronDown, ChevronRight, FileSpreadsheet, File, Folder, Plus, Minus, RefreshCw
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function EmployeeDocs() {
  const { user } = useAuth();
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "POLICY MANUALS": true,
    "STANDARDS OF PRACTICE": false,
    "CORPORATE DOCUMENTS": false,
    "PRINTABLE FORMS": false
  });
  
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (!user) return null;

  // Filter docs accessible to all (employees)
  const accessibleDocs = MOCK_DOCUMENTS.filter(d => d.sharedWith === "all");

  const CATEGORIES = [
    "POLICY MANUALS",
    "STANDARDS OF PRACTICE",
    "CORPORATE DOCUMENTS",
    "PRINTABLE FORMS"
  ] as const;

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAction = (e: React.MouseEvent, action: string, category: string) => {
    e.stopPropagation();
    if (action === 'add') {
      alert(`Add document to ${category}`);
    } else if (action === 'remove') {
      if (!selectedDocId) {
        alert("Please select a document first");
        return;
      }
      alert(`Remove document ${selectedDocId}`);
    } else if (action === 'replace') {
      if (!selectedDocId) {
        alert("Please select a document first");
        return;
      }
      alert(`Replace document ${selectedDocId}`);
    }
  };

  const getFileIcon = (type: string, className?: string) => {
    switch(type) {
      case 'pdf': return <FileText className={className || "w-6 h-6 text-red-500"} />;
      case 'xlsx':
      case 'xls': return <FileSpreadsheet className={className || "w-6 h-6 text-green-600"} />;
      case 'docx':
      case 'doc': return <FileText className={className || "w-6 h-6 text-blue-600"} />;
      default: return <File className={className || "w-6 h-6 text-slate-500"} />;
    }
  };

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

      {/* Primary Document Library Accordion */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-900">Document Vault</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {CATEGORIES.map((category) => {
            const isExpanded = expandedCategories[category];
            const categoryDocs = accessibleDocs.filter(d => d.category === category);
            
            // Check if selected doc is in this category for button states
            const hasSelectedDocInCategory = selectedDocId && categoryDocs.some(d => d.id === selectedDocId);

            return (
              <div key={category} className="flex flex-col">
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? 
                      <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors" /> : 
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                    }
                    <Folder className="w-5 h-5 text-brand-500 fill-brand-100/50" />
                    <span className="font-semibold text-brand-900 tracking-wide">{category}</span>
                    <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                      {categoryDocs.length}
                    </span>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleAction(e, 'add', category)}
                      className="p-1.5 rounded text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                      title={`Add Document to ${category}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleAction(e, 'remove', category)}
                      className={`p-1.5 rounded transition-colors ${hasSelectedDocInCategory ? 'text-slate-600 hover:text-red-600 hover:bg-red-50' : 'text-slate-300 cursor-not-allowed'}`}
                      title={hasSelectedDocInCategory ? "Remove Selected" : "Select a document to remove"}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleAction(e, 'replace', category)}
                      className={`p-1.5 rounded transition-colors ${hasSelectedDocInCategory ? 'text-slate-600 hover:text-accent-600 hover:bg-accent-50' : 'text-slate-300 cursor-not-allowed'}`}
                      title={hasSelectedDocInCategory ? "Replace Selected" : "Select a document to replace"}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="bg-slate-50/50 border-t border-slate-100 p-2 space-y-1">
                    {categoryDocs.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-sm italic">
                        No documents in this category.
                      </div>
                    ) : (
                      categoryDocs.map(doc => {
                        const isSelected = selectedDocId === doc.id;
                        return (
                          <div 
                            key={doc.id}
                            onClick={() => setSelectedDocId(doc.id)}
                            onDoubleClick={() => alert(`Downloading ${doc.name}...`)}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                              isSelected 
                                ? "bg-brand-50 border border-brand-200 shadow-sm" 
                                : "hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                {getFileIcon(doc.type)}
                              </div>
                              <div>
                                <h3 className={`font-medium ${isSelected ? "text-brand-900" : "text-slate-700"}`}>
                                  {doc.name}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                  <span className="uppercase font-semibold">{doc.type}</span>
                                  <span>•</span>
                                  <span>{(doc.sizeBytes / 1000000).toFixed(1)} MB</span>
                                  <span>•</span>
                                  <span>Updated {new Date(doc.modifiedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Selected Indicator */}
                            <div className="px-2">
                              {isSelected ? (
                                <div className="text-brand-600 bg-brand-100 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                                  Selected
                                </div>
                              ) : (
                                <div className="w-16"></div> /* spacer to keep layout stable*/
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
