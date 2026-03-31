"use client";

import { FEATURED_DOCS, CATEGORIZED_DOCS } from '@/lib/mock-docs';
import { Eye, Download, Folder, FileText, HeartHandshake } from 'lucide-react';

export function EmployeeDocuments() {
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
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Recently Published</h2>
          <button className="text-brand-800 font-bold text-sm hover:underline hover:text-brand-900">
            View All Updates
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_DOCS.map((doc) => (
            <div 
              key={doc.id} 
              className={`p-6 md:p-8 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ${doc.bgColor} ${doc.textColor} min-h-[220px]`}
            >
              <div>
                <span className={`inline-block px-3 py-1 text-xs font-black tracking-widest rounded-full mb-4 ${doc.tagColor}`}>
                  {doc.tag}
                </span>
                <h3 className="text-2xl font-bold mb-2 leading-tight">{doc.title}</h3>
                <p className="opacity-90 text-sm font-medium pr-4 leading-relaxed line-clamp-2">
                  {doc.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-8">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">{doc.publishedAt}</span>
                <button onClick={() => alert(`Opening ${doc.title}...`)} className={`px-5 py-2 rounded-full font-bold text-sm shadow-sm transition-transform active:scale-95 ${doc.btnColor}`}>
                  {doc.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Documents Categories */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">All Documents</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* HR Column */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-3 font-bold text-lg text-slate-800 mb-6">
              <Folder className="w-5 h-5 text-brand-700" />
              HR & Handbooks
            </h3>
            {CATEGORIZED_DOCS.hr.items.map(doc => (
              <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{doc.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">{doc.subtext}</p>
                </div>
                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => alert(`Viewing ${doc.title} safely.`)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                     <Eye className="w-4 h-4" />
                   </button>
                   <button onClick={() => alert(`${doc.title} downloaded to your local device.`)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                     <Download className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>

          {/* Policy Column */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-3 font-bold text-lg text-slate-800 mb-6">
              <FileText className="w-5 h-5 text-brand-700" />
              Policy Manuals
            </h3>
            {CATEGORIZED_DOCS.policy.items.map(doc => (
              <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{doc.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">{doc.subtext}</p>
                </div>
                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => alert(`Viewing ${doc.title} safely.`)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                     <Eye className="w-4 h-4" />
                   </button>
                   <button onClick={() => alert(`${doc.title} downloaded to your local device.`)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                     <Download className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>

          {/* Benefit Column */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-3 font-bold text-lg text-slate-800 mb-6">
              <HeartHandshake className="w-5 h-5 text-brand-700" />
              Benefit Guides
            </h3>
            {CATEGORIZED_DOCS.benefits.items.map(doc => (
              <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{doc.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">{doc.subtext}</p>
                </div>
                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => alert(`Viewing ${doc.title} safely.`)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                     <Eye className="w-4 h-4" />
                   </button>
                   <button onClick={() => alert(`${doc.title} downloaded to your local device.`)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                     <Download className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
