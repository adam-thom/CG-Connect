"use client";

import { useState } from 'react';
import { ADMIN_REGISTRY } from '@/lib/mock-docs';
import { PlusCircle, Search, FileText, Image as ImageIcon, X, UploadCloud, Users, ArchiveRestore } from 'lucide-react';
import Image from 'next/image';

export function AdminDocuments() {
  const [registry, setRegistry] = useState(ADMIN_REGISTRY);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpdateClick = (id: string) => {
    setSelectedDocId(id);
    setIsUpdateModalOpen(true);
  };

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to remove this document?")) {
      setRegistry(prev => prev.filter(doc => doc.id !== id));
    }
  };

  const handleOverwrite = () => {
    alert("New file payload accepted and synchronized.");
    setIsUpdateModalOpen(false);
  };

  const handleAddNew = () => {
    const newDoc = {
      id: `r${Date.now()}`,
      title: "New_Company_Policy.pdf",
      subtitle: "Newly uploaded document",
      type: "GENERAL",
      lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      icon: "pdf"
    };
    setRegistry([newDoc, ...registry]);
    setIsAddModalOpen(false);
    alert("New document successfully added to the registry.");
  };

  const filteredRegistry = registry.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoc = registry.find(d => d.id === selectedDocId);

  return (
    <div className="max-w-7xl mx-auto py-8 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">PORTAL <span className="text-slate-300">&gt;</span> DOCUMENT CONTROL</div>
           <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Company Documents</h1>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#91665b] hover:bg-[#674840] text-white px-6 py-3.5 flex items-center gap-2 rounded-full font-bold shadow-sm transition-all active:scale-95">
          <PlusCircle className="w-5 h-5" />
          Add New Document
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Central Library Stats */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden relative">
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-50 rounded-full opacity-60 mix-blend-multiply blur-3xl pointer-events-none"></div>
           <div className="relative z-10 max-w-lg">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">CENTRAL LIBRARY</div>
             <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{registry.length} Active Files</h2>
             <p className="text-slate-600 text-lg leading-relaxed">
                Securely storing sensitive operational manuals, forms, and compliance certifications.
             </p>
           </div>
           
           <div className="flex items-center gap-4 mt-8 pt-4">
             <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-500" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center">
                    <ArchiveRestore className="w-5 h-5 text-slate-200" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#fdf5f3] text-[#91665b] border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold z-10">
                   +4
                </div>
             </div>
             <span className="text-sm font-medium text-slate-500">Viewing access shared with staff</span>
           </div>
        </div>

        {/* Cloud Usage Stats */}
        <div className="col-span-1 bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col justify-between">
           <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">CLOUD USAGE</div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4">
                <div className="bg-[#91665b] h-3 rounded-full" style={{ width: '62%' }}></div>
              </div>
              <p className="text-slate-900 font-black text-xl">
                 6.2 GB <span className="text-slate-400 font-medium text-base">of 10 GB</span>
              </p>
           </div>
           
           <button className="text-[#91665b] font-bold mt-6 text-left hover:text-[#674840] transition-colors flex items-center gap-1 group">
             Upgrade Storage <span className="group-hover:translate-x-1 transition-transform">-&gt;</span>
           </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 sm:p-10">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Document Registry</h2>
            <div className="relative max-w-md w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search documents..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91665b]/20 transition-shadow" />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-slate-100">
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-4">Document Name</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-4 hidden md:table-cell">Type</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-4 hidden sm:table-cell">Last Modified</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right pr-4">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredRegistry.map(doc => (
                    <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="py-6 pl-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${doc.icon === 'pdf' ? 'bg-red-50 text-red-500' : doc.icon === 'xls' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                               <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-[15px]">{doc.title}</p>
                              <p className="text-xs text-slate-500 mt-1 font-medium">{doc.subtitle}</p>
                            </div>
                          </div>
                       </td>
                       <td className="py-6 pl-4 hidden md:table-cell">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[11px] font-black tracking-widest">
                            {doc.type}
                          </span>
                       </td>
                       <td className="py-6 pl-4 text-sm text-slate-600 font-medium hidden sm:table-cell">
                          {doc.lastModified}
                       </td>
                       <td className="py-6 pr-4 text-right">
                          <div className="flex items-center justify-end gap-5">
                             <button onClick={() => handleRemove(doc.id)} className="text-xs font-bold tracking-widest text-[#91665b]/40 hover:text-red-500 transition-colors">REMOVE</button>
                             <button onClick={() => handleUpdateClick(doc.id)} className="text-xs font-bold tracking-widest text-[#91665b] hover:text-[#674840] transition-colors">UPDATE</button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* UPDATE MODAL overlay */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setIsUpdateModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <div className="w-14 h-14 bg-[#fdf5f3] rounded-2xl flex items-center justify-center mb-6 text-[#91665b]">
                 <UploadCloud className="w-6 h-6" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Update Document</h3>
              <p className="text-slate-500 mb-8 max-w-[280px]">
                You are preparing to overwrite <strong>{selectedDoc?.title || "selected file"}</strong>. Upload the new payload below.
              </p>
              
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-[#91665b] hover:bg-[#91665b]/5 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#91665b] group-hover:text-white transition-colors mb-4">
                     <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Click to upload file</span>
                  <span className="text-xs text-slate-400 mt-1">PDF, DOCX, or XLSX (Max 10MB)</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                 <button onClick={() => setIsUpdateModalOpen(false)} className="py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Cancel
                 </button>
                 <button onClick={handleOverwrite} className="py-3.5 rounded-xl font-bold text-white bg-[#91665b] hover:bg-[#674840] transition-colors shadow-sm active:scale-95">
                    Overwrite File
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ADD MODAL overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600">
                 <PlusCircle className="w-6 h-6" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload New Document</h3>
              <p className="text-slate-500 mb-8 max-w-[280px]">
                Add a new file to the secure company registry. It will immediately be synchronized across staff portals.
              </p>
              
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-brand-500 hover:bg-brand-50/50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-colors mb-4">
                     <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Click to upload file</span>
                  <span className="text-xs text-slate-400 mt-1">PDF, DOCX, or XLSX (Max 10MB)</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                 <button onClick={() => setIsAddModalOpen(false)} className="py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Cancel
                 </button>
                 <button onClick={handleAddNew} className="py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm active:scale-95">
                    Upload to Registry
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
