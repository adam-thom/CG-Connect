"use client";

import { Eye, Download, Folder, FileText } from 'lucide-react';

export function EmployeeDocuments({ documents, categories }: { documents: any[], categories: any[] }) {
  
  // Sort documents by most recent to pick featured ones
  const sortedDocs = [...documents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const featuredDocs = sortedDocs.slice(0, 3).map((doc, idx) => {
    const bgColors = ["bg-[#91665b]", "bg-[#F7F4EF]", "bg-[#E6E8E8]"];
    const textColors = ["text-white", "text-slate-900", "text-slate-900"];
    const tagColors = ["bg-white/20 text-white", "bg-slate-200/60 text-slate-600", "bg-white text-slate-600 font-bold"];
    const btnColors = ["bg-white text-slate-900 hover:bg-slate-50", "bg-[#674840] text-white hover:bg-[#674840]", "bg-slate-900 text-white hover:bg-slate-800"];
    
    return {
      ...doc,
      bgColor: bgColors[idx % bgColors.length],
      textColor: textColors[idx % textColors.length],
      tagColor: tagColors[idx % tagColors.length],
      btnColor: btnColors[idx % btnColors.length]
    };
  });

  const getDocumentsByCategory = (categoryId: string) => {
    return documents.filter(doc => doc.categoryId === categoryId);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Company Documents</h1>
        <p className="text-slate-600 mt-2 text-lg max-w-xl">
          Access your essential guides, policies, and schedules in one curated digital space.
        </p>
      </div>

      {/* Recently Published Slider/Row */}
      {featuredDocs.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Recently Published</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDocs.map((doc) => (
              <div 
                key={doc.id} 
                className={`p-6 md:p-8 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ${doc.bgColor} ${doc.textColor} min-h-[220px]`}
              >
                <div>
                  <span className={`inline-block px-3 py-1 text-xs font-black tracking-widest rounded-full mb-4 ${doc.tagColor}`}>
                    {doc.category.name}
                  </span>
                  <h3 className="text-2xl font-bold mb-2 leading-tight">{doc.name}</h3>
                  <p className="opacity-90 text-sm font-medium pr-4 leading-relaxed line-clamp-2">
                    Size: {(doc.sizeBytes / 1024).toFixed(0)} KB
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-8">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  <a href={`/api/docs/${doc.id}`} target="_blank" rel="noreferrer" className={`px-5 py-2 rounded-full font-bold text-sm shadow-sm transition-transform active:scale-95 ${doc.btnColor}`}>
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Documents Categories */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">All Documents</h2>
        
        {categories.length === 0 ? (
           <p className="text-slate-500 font-medium">No document categories exist.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {categories.map(category => {
               const docs = getDocumentsByCategory(category.id);
               if (docs.length === 0) return null; // Don't show empty categories for employees

               return (
                 <div key={category.id} className="space-y-4">
                    <h3 className="flex items-center gap-3 font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-2">
                      <Folder className="w-5 h-5 text-brand-700" />
                      {category.name}
                    </h3>
                    {docs.map(doc => (
                      <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <FileText className="w-6 h-6 text-slate-300" />
                           <div>
                             <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                             <p className="text-xs text-slate-500 font-medium mt-1">{(doc.sizeBytes / 1024).toFixed(1)} KB</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                           <a href={`/api/docs/${doc.id}`} target="_blank" rel="noreferrer" title="View Document" className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                             <Eye className="w-4 h-4" />
                           </a>
                           <a href={`/api/docs/${doc.id}?download=1`} download title="Download" className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                             <Download className="w-4 h-4" />
                           </a>
                        </div>
                      </div>
                    ))}
                 </div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
