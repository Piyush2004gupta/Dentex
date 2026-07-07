import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, Cpu, Heart, CheckCircle2, ChevronRight, BarChart3, Database, Maximize, ImagePlus, FlaskConical } from 'lucide-react';
import heroScanImg from '../assets/hero_scan.png';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* 1. Hero Section (Match Mockup) */}
      <section className="relative overflow-hidden pt-20 pb-32 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Text & CTAs */}
            <div className="flex flex-col items-start text-left pt-10">
              <h1 className="text-5xl lg:text-[4rem] font-extrabold tracking-tight text-[#0f172a] leading-[1.1] font-sans">
                Understand your smile's unique story.
              </h1>
              <p className="mt-6 text-xl leading-8 text-slate-500 max-w-lg">
                A quick, guided scan to help you track your progress and build a better routine, step by step.
              </p>
              
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/predict"
                  className="flex items-center gap-2 rounded-xl bg-[#0f172a] px-6 py-4 text-base font-bold text-white shadow-md hover:bg-slate-800 transition-all">
                  
                  <Maximize size={20} />
                  Start Scan
                </Link>
                <Link
                  to="/predict"
                  className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-4 text-base font-bold text-[#0f172a] shadow-sm hover:bg-slate-50 transition-all">
                  
                  <ImagePlus size={20} />
                  Upload Photo
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                You can also drag and drop an image here.
              </p>
            </div>

            {/* Right Column: Image & Badge */}
            <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0">
              <div className="relative bg-white rounded-[2rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md w-full z-10">
                <div className="bg-slate-50 rounded-[1.5rem] overflow-hidden relative">
                  <img src={heroScanImg} alt="AI Dental Scan" className="w-full h-auto object-cover opacity-90" />
                  
                  {/* Floating Badge */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2 border border-slate-100 whitespace-nowrap z-20">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                    <span className="text-sm font-bold text-[#0f172a]">Ready to scan</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative background blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/40 to-emerald-50/40 blur-3xl -z-10 rounded-full"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Blank Sections as requested */}
      <section id="about" className="min-h-[10vh] bg-white"></section>
      <section id="features" className="bg-[#f8fafc]"></section>
      {/* 5. Footer (Match Mockup) */}
      <footer className="mt-auto bg-[#111c38] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-[#2a3656]">
            
            {/* Left: Logo */}
            <div className="flex-1 flex justify-start">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  SmileGuard
                </span>
              </div>
            </div>

            {/* Center: Heart/Labs */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="relative flex items-center justify-center w-8 h-8 text-[#d83f87]">
                <Heart size={28} fill="currentColor" />
                <FlaskConical size={12} className="absolute text-white top-2" />
              </div>
              <span className="text-sm font-medium text-[#8b9bb4]">A creation of Hope Labs</span>
            </div>

            {/* Right: Links */}
            <div className="flex-1 flex justify-end gap-6">
              <a href="#" className="text-sm font-semibold text-white hover:text-slate-300 transition-colors">Privacy Policy</a>
              <Link to="/terms" className="text-sm font-semibold text-white hover:text-slate-300 transition-colors">Terms</Link>
            </div>

          </div>
          
          <div className="pt-8 flex justify-center">
            <p className="text-sm text-[#8b9bb4] font-medium">
              &copy; 2026 SmileGuard by HOPELABSAI Solution Private Limited
            </p>
          </div>
        </div>
      </footer>

    </div>);

};

export default LandingPage;