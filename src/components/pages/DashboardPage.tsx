"use client";

import Link from "next/link";
import { StudentProfileSummary } from "@/components/StudentProfileSummary";

export function DashboardPage() {
  return (
    <>
      <div className="mx-auto max-w-[1440px] space-y-gutter">
      <StudentProfileSummary />

      <div className="grid grid-cols-12 gap-gutter">
      
      <section className="col-span-12 lg:col-span-8 space-y-gutter">
      <div className="portal-section border rounded-xl border-pastel-blue-border bg-pastel-blue/30 p-4 custom-shadow">
      <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary" data-icon="event_note">event_note</span>
      <h3 className="text-headline-sm font-headline-sm">Today's Classes</h3>
      </div>
      <Link href="/timetable" className="text-primary font-label-md hover:underline flex items-center gap-1">
                                      View Full Timetable <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
      </Link>
      </div>
      <div className="space-y-3">
      
      <div className="flex items-center p-3 border border-pastel-green-border rounded-lg hover:border-primary transition-colors group bg-pastel-green">
      <div className="flex flex-col items-center justify-center w-16 border-r border-pastel-green-border pr-3">
      <span className="text-label-md font-label-md text-pastel-green-text">09:00</span>
      <span className="text-label-sm font-label-sm text-on-surface-variant">AM</span>
      </div>
      <div className="flex-1 px-4">
      <h4 className="text-label-md font-label-md text-on-surface">Data Structures &amp; Algorithms</h4>
      <p className="text-body-sm font-body-sm text-on-surface-variant">Lab 402 • Prof. Sarah Jenkins</p>
      </div>
      <div className="flex flex-col items-end">
      <span className="px-3 py-1 rounded-full bg-success/20 text-success text-label-sm font-label-sm border border-success/30">Ongoing</span>
      </div>
      </div>
      
      <div className="flex items-center p-3 border border-pastel-purple-border rounded-lg hover:border-primary transition-colors group bg-pastel-purple">
      <div className="flex flex-col items-center justify-center w-16 border-r border-pastel-purple-border pr-3">
      <span className="text-label-md font-label-md text-pastel-purple-text">11:30</span>
      <span className="text-label-sm font-label-sm text-on-surface-variant">AM</span>
      </div>
      <div className="flex-1 px-4">
      <h4 className="text-label-md font-label-md text-on-surface">Digital Signal Processing</h4>
      <p className="text-body-sm font-body-sm text-on-surface-variant">Lecture Hall C • Dr. Michael Chen</p>
      </div>
      <div className="flex flex-col items-end">
      <span className="px-3 py-1 rounded-full bg-pastel-yellow text-pastel-yellow-text text-label-sm font-label-sm border border-pastel-yellow-border">Upcoming</span>
      </div>
      </div>
      
      <div className="flex items-center p-3 border border-pastel-coral-border rounded-lg hover:border-primary transition-colors group bg-pastel-coral">
      <div className="flex flex-col items-center justify-center w-16 border-r border-pastel-coral-border pr-3">
      <span className="text-label-md font-label-md text-pastel-coral-text">02:30</span>
      <span className="text-label-sm font-label-sm text-on-surface-variant">PM</span>
      </div>
      <div className="flex-1 px-4">
      <h4 className="text-label-md font-label-md text-on-surface">Academic Writing Seminar</h4>
      <p className="text-body-sm font-body-sm text-on-surface-variant">Library Room 12 • Emily Watson</p>
      </div>
      <div className="flex flex-col items-end">
      <span className="px-3 py-1 rounded-full bg-pastel-mint text-pastel-mint-text text-label-sm font-label-sm border border-pastel-mint-border">Upcoming</span>
      </div>
      </div>
      </div>
      </div>
      
      <div className="portal-section border rounded-xl border-pastel-purple-border bg-pastel-purple/35 p-4 custom-shadow">
      <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary" data-icon="task">task</span>
      <h3 className="text-headline-sm font-headline-sm">Assignments Due</h3>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      
      <div className="p-3 rounded-lg border-l-4 border-urgent bg-pastel-coral flex flex-col justify-between">
      <div>
      <div className="flex justify-between mb-2">
      <span className="text-label-sm font-label-sm text-urgent uppercase font-bold">Urgent</span>
      <span className="text-label-sm font-label-sm text-on-surface-variant">Due in 18 hrs</span>
      </div>
      <h4 className="text-label-md font-label-md text-on-surface">Compiler Design Project</h4>
      <p className="text-body-sm font-body-sm text-on-surface-variant mb-3">Final Submission Phase 1</p>
      </div>
      <Link href="/assignment-dashboard" className="w-full py-2 bg-white/80 border border-pastel-coral-border rounded-lg text-label-sm font-label-sm hover:bg-white transition-colors text-center block">Submit Now</Link>
      </div>
      
      <div className="p-3 rounded-lg border-l-4 border-warning bg-pastel-yellow flex flex-col justify-between">
      <div>
      <div className="flex justify-between mb-2">
      <span className="text-label-sm font-label-sm text-warning uppercase font-bold">Medium</span>
      <span className="text-label-sm font-label-sm text-on-surface-variant">Due in 3 days</span>
      </div>
      <h4 className="text-label-md font-label-md text-on-surface">Database Management</h4>
      <p className="text-body-sm font-body-sm text-on-surface-variant mb-3">SQL Normalization Quiz</p>
      </div>
      <Link href="/assignment-dashboard" className="w-full py-2 bg-white/80 border border-pastel-yellow-border rounded-lg text-label-sm font-label-sm hover:bg-white transition-colors text-center block">View Details</Link>
      </div>
      </div>
      </div>
      </section>
      
      <aside className="col-span-12 lg:col-span-4 space-y-gutter">
      
      <div className="portal-section border rounded-xl border-pastel-green-border bg-pastel-green/40 p-4 custom-shadow">
      <h3 className="text-label-md font-label-md text-pastel-green-text uppercase mb-3 tracking-wider">Attendance Summary</h3>
      <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
      <svg className="w-full h-full transform -rotate-90">
      <circle className="text-surface-container" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
      <circle className="text-success transition-all duration-1000" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="37.6" strokeWidth="8"></circle>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-headline-sm font-headline-sm text-on-surface">85%</span>
      </div>
      </div>
      <div className="flex-1">
      <p className="text-body-sm font-body-sm text-on-surface-variant">Overall attendance is healthy. Maintain 75% to stay eligible for finals.</p>
      <div className="mt-2 flex gap-2">
      <div className="flex-1 h-1 bg-success rounded"></div>
      <div className="flex-1 h-1 bg-surface-container rounded"></div>
      <div className="flex-1 h-1 bg-surface-container rounded"></div>
      </div>
      </div>
      </div>
      </div>
      
      <div className="portal-section border rounded-xl border-pastel-yellow-border bg-pastel-yellow/45 p-6 custom-shadow">
      <div className="flex justify-between items-center mb-4">
      <h3 className="text-label-md font-label-md text-pastel-yellow-text uppercase tracking-wider">Oct 2024</h3>
      <div className="flex gap-2">
      <button className="p-1 hover:bg-pastel-yellow rounded transition-colors">
      <span className="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
      </button>
      <button className="p-1 hover:bg-pastel-yellow rounded transition-colors">
      <span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
      </button>
      </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
      <span className="text-[10px] font-bold text-outline uppercase">M</span>
      <span className="text-[10px] font-bold text-outline uppercase">T</span>
      <span className="text-[10px] font-bold text-outline uppercase">W</span>
      <span className="text-[10px] font-bold text-outline uppercase">T</span>
      <span className="text-[10px] font-bold text-outline uppercase">F</span>
      <span className="text-[10px] font-bold text-outline uppercase">S</span>
      <span className="text-[10px] font-bold text-outline uppercase">S</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
      
      <span className="text-label-sm py-2 text-outline-variant">30</span>
      <span className="text-label-sm py-2">1</span>
      <span className="text-label-sm py-2">2</span>
      <span className="text-label-sm py-2">3</span>
      <span className="text-label-sm py-2 bg-pastel-blue text-pastel-blue-text font-bold rounded-lg relative">
                                      4
                                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
      </span>
      <span className="text-label-sm py-2">5</span>
      <span className="text-label-sm py-2">6</span>
      <span className="text-label-sm py-2">7</span>
      <span className="text-label-sm py-2">8</span>
      <span className="text-label-sm py-2 border border-pastel-purple-border rounded-lg bg-pastel-purple/50">9</span>
      <span className="text-label-sm py-2">10</span>
      <span className="text-label-sm py-2">11</span>
      <span className="text-label-sm py-2">12</span>
      <span className="text-label-sm py-2">13</span>
      <span className="text-label-sm py-2">14</span>
      <span className="text-label-sm py-2">15</span>
      <span className="text-label-sm py-2">16</span>
      </div>
      </div>
      
      <div className="portal-section border rounded-xl border-pastel-coral-border bg-pastel-coral/35 p-6 custom-shadow">
      <div className="flex justify-between items-center mb-4">
      <h3 className="text-label-md font-label-md text-pastel-coral-text uppercase tracking-wider">Updates</h3>
      <span className="text-pastel-coral-text text-[10px] font-bold px-1.5 py-0.5 bg-pastel-coral border border-pastel-coral-border rounded">3 NEW</span>
      </div>
      <div className="space-y-4">
      <div className="flex gap-3">
      <div className="mt-1 w-8 h-8 rounded-full bg-pastel-blue flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-primary text-sm" data-icon="library_books">library_books</span>
      </div>
      <div>
      <p className="text-body-sm font-body-sm text-on-surface leading-snug"><span className="font-bold">Library Notice:</span> Renewal for 'Clean Code' is successful.</p>
      <p className="text-[11px] text-on-surface-variant mt-0.5">2 hours ago</p>
      </div>
      </div>
      <div className="flex gap-3">
      <div className="mt-1 w-8 h-8 rounded-full bg-pastel-yellow flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-secondary text-sm" data-icon="account_balance">account_balance</span>
      </div>
      <div>
      <p className="text-body-sm font-body-sm text-on-surface leading-snug"><span className="font-bold">Finance:</span> Fee receipt generated for Sem 3.</p>
      <p className="text-[11px] text-on-surface-variant mt-0.5">Yesterday</p>
      </div>
      </div>
      <div className="flex gap-3">
      <div className="mt-1 w-8 h-8 rounded-full bg-pastel-purple flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-pastel-purple-text text-sm" data-icon="campaign">campaign</span>
      </div>
      <div>
      <p className="text-body-sm font-body-sm text-on-surface leading-snug"><span className="font-bold">System:</span> CAMU 2.0 Maintenance scheduled for Sunday.</p>
      <p className="text-[11px] text-on-surface-variant mt-0.5">Oct 02, 2024</p>
      </div>
      </div>
      </div>
      <Link href="/notifications" className="w-full mt-6 py-2 border-t border-outline-variant text-label-sm font-label-sm text-primary hover:text-primary-container transition-colors text-center block">View All Notifications</Link>
      </div>
      </aside>
      </div>
      </div>
    </>
  );
}
