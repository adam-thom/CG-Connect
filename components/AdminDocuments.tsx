"use client";

import { useState } from 'react';
import { PlusCircle, Search, FileText, Image as ImageIcon, X, UploadCloud, Users, ArchiveRestore, FolderPlus, Trash2 } from 'lucide-react';
import { createDocument, updateDocument, deleteDocument, createDocumentCategory, deleteDocumentCategory } from '@/app/actions/docs';

export function AdminDocuments({ documents, categories, tags }: { documents: any[], categories: any[], tags: any[] }) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isManageCategoryModalOpen, setIsManageCategoryModalOpen] = useState(false);
  
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpdateClick = (id: string) => {
    setSelectedDocId(id);
    setIsUpdateModalOpen(true);
  };

  const handleRemove = async (id: string) => {
    if (confirm("Are you sure you want to remove this document?")) {
      await deleteDocument(id);
    }
  };

  const handleRemoveCategory = async (id: string) => {
    if (confirm("Are you sure you want to remove this category? Docs must be removed first.")) {
      const res = await deleteDocumentCategory(id);
      if (res?.error) alert(res.error);
    }
  };

  const filteredRegistry = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="max-w-7xl mx-auto py-8 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">PORTAL <span className="text-slate-300">&gt;</span> DOCUMENT CONTROL</div>
           <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Company Documents</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsManageCategoryModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 flex items-center gap-2 rounded-full font-bold shadow-sm transition-all active:scale-95">
            <FolderPlus className="w-5 h-5" />
            Categories
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#91665b] hover:bg-[#674840] text-white px-6 py-3.5 flex items-center gap-2 rounded-full font-bold shadow-sm transition-all active:scale-95">
            <PlusCircle className="w-5 h-5" />
            Add New Document
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Central Library Stats */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden relative">
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-50 rounded-full opacity-60 mix-blend-multiply blur-3xl pointer-events-none"></div>
           <div className="relative z-10 max-w-lg">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">CENTRAL LIBRARY</div>
             <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{documents.length} Active Files</h2>
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
                   {categories.length}
                </div>
             </div>
             <span className="text-sm font-medium text-slate-500">Categories</span>
           </div>
        </div>

        {/* Cloud Usage Stats */}
        <div className="col-span-1 bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col justify-between">
           <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">CLOUD USAGE</div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4">
                {/* Dynamically calculate size usage if scaling beyond mock sizes */}
                <div className="bg-[#91665b] h-3 rounded-full" style={{ width: '12%' }}></div>
              </div>
              <p className="text-slate-900 font-black text-xl">
                 {(documents.reduce((acc, doc) => acc + (doc.sizeBytes || 0), 0) / 1000000).toFixed(2)} MB <span className="text-slate-400 font-medium text-base">used</span>
              </p>
           </div>
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
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-4 hidden md:table-cell">Type/Category</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-4 hidden sm:table-cell">Uploaded On</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right pr-4">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredRegistry.map(doc => (
                    <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="py-6 pl-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${doc.type === 'PDF' ? 'bg-red-50 text-red-500' : doc.type === 'XLSX' || doc.type === 'XLS' ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-600'}`}>
                               <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-[15px]">{doc.name}</p>
                              <p className="text-xs text-slate-500 mt-1 font-medium">{doc.visibilityTags.map((t: any) => t.name).join(', ')}</p>
                            </div>
                          </div>
                       </td>
                       <td className="py-6 pl-4 hidden md:table-cell">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[11px] font-black tracking-widest">
                            {doc.category.name}
                          </span>
                       </td>
                       <td className="py-6 pl-4 text-sm text-slate-600 font-medium hidden sm:table-cell">
                          {new Date(doc.createdAt).toLocaleDateString()}
                       </td>
                       <td className="py-6 pr-4 text-right">
                          <div className="flex items-center justify-end gap-5">
                             <button onClick={() => handleUpdateClick(doc.id)} className="text-xs font-bold tracking-widest text-[#91665b] hover:text-[#674840] transition-colors">EDIT</button>
                             <a href={`/api/docs/${doc.id}`} target="_blank" rel="noreferrer" className="text-xs font-bold tracking-widest text-brand-600 hover:text-brand-800 transition-colors">VIEW</a>
                             <button onClick={() => handleRemove(doc.id)} className="text-xs font-bold tracking-widest text-red-400 hover:text-red-500 transition-colors">REMOVE</button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {filteredRegistry.length === 0 && (
                     <tr><td colSpan={4} className="py-10 text-center text-slate-500 font-medium">No documents found in registry.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* ADD CATEGORY MODAL overlay (Nested in MANAGE CATEGORY conceptually) */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
           <form action={async (formData) => {
              const res = await createDocumentCategory(null, formData);
              if (res?.error) alert(res.error);
              else setIsAddCategoryModalOpen(false);
           }} className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-6">New Category</h3>
              
              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category Name</label>
                   <input type="text" name="name" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#91665b]/20 outline-none" placeholder="e.g. Employee Handbooks" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                 <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} className="py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Cancel
                 </button>
                 <button type="submit" className="py-3.5 rounded-xl font-bold text-white bg-[#91665b] hover:bg-[#674840] transition-colors shadow-sm active:scale-95">
                    Save Category
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* MANAGE CATEGORIES MODAL overlay */}
      {isManageCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setIsManageCategoryModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-bold text-slate-900">Categories</h3>
                 <button onClick={() => setIsAddCategoryModalOpen(true)} className="text-sm font-bold text-[#91665b] hover:underline">
                   + New Category
                 </button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                 {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                       <span className="font-bold text-slate-800">{cat.name}</span>
                       <button onClick={() => handleRemoveCategory(cat.id)} className="p-2 hover:bg-red-100 rounded-full text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
                 {categories.length === 0 && (
                   <p className="text-slate-500 text-center py-4 text-sm font-medium">No categories created yet.</p>
                 )}
              </div>
              
           </div>
        </div>
      )}

      {/* ADD DOCUMENT MODAL overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <form action={async (formData) => {
               const res = await createDocument(null, formData);
               if (res?.error) alert(res.error);
               else setIsAddModalOpen(false);
           }} className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-xl w-full flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600">
                 <PlusCircle className="w-6 h-6" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload New Document</h3>
              <p className="text-slate-500 mb-8">
                Add a new file to the secure company registry. Set visibility below.
              </p>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">File</label>
                    <input type="file" name="file" required className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 outline-none" />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                    <select name="categoryId" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#91665b]/20 outline-none font-medium text-slate-700">
                        <option value="">Select a Category...</option>
                        {categories.map(cat => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 mt-4">Visibility Tags</label>
                    <p className="text-xs text-slate-400 mb-4">Only users possessing at least one of these tags will view this document.</p>
                    <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50">
                       {tags.map(tag => (
                          <label key={tag.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors">
                             <input type="checkbox" name="tags" value={tag.id} className="w-4 h-4 text-[#91665b] rounded focus:ring-[#91665b] border-gray-300" />
                             <span className="text-sm font-medium text-slate-700">{tag.name}</span>
                          </label>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-10">
                 <button type="button" onClick={() => setIsAddModalOpen(false)} className="py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Cancel
                 </button>
                 <button type="submit" className="py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm active:scale-95">
                    Upload to Registry
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* UPDATE DOCUMENT MODAL overlay */}
      {isUpdateModalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
           <form action={async (formData) => {
               const res = await updateDocument(selectedDoc.id, formData);
               if (res?.error) alert(res.error);
               else {
                 setIsUpdateModalOpen(false);
                 setSelectedDocId(null);
               }
           }} className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-xl w-full flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="w-5 h-5" />
              </button>
              
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600">
                 <FileText className="w-6 h-6" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Update Document: {selectedDoc.name}</h3>
              <p className="text-slate-500 mb-8">
                Change category, visibility tags, or optionally replace the file.
              </p>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Replace File (Optional)</label>
                    <input type="file" name="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 outline-none" />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                    <select name="categoryId" required defaultValue={selectedDoc.categoryId} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#91665b]/20 outline-none font-medium text-slate-700">
                        <option value="">Select a Category...</option>
                        {categories.map(cat => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 mt-4">Visibility Tags</label>
                    <p className="text-xs text-slate-400 mb-4">Users must have at least one of these tags to view.</p>
                    <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50">
                       {tags.map(tag => (
                          <label key={tag.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors">
                             <input type="checkbox" name="tags" value={tag.id} defaultChecked={selectedDoc.visibilityTags.some((t:any) => t.id === tag.id)} className="w-4 h-4 text-[#91665b] rounded focus:ring-[#91665b] border-gray-300" />
                             <span className="text-sm font-medium text-slate-700">{tag.name}</span>
                          </label>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-10">
                 <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Cancel
                 </button>
                 <button type="submit" className="py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm active:scale-95">
                    Save Changes
                 </button>
              </div>
           </form>
        </div>
      )}

    </div>
  );
}
