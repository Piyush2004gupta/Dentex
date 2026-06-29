import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, Cpu, Heart, CheckCircle2, ChevronRight, BarChart3, Database } from 'lucide-react';

const LandingPage: React.FC = () => {
  const faqs = [
    {
      q: "How does DENTEX detect dental diseases?",
      a: "DENTEX uses a state-of-the-art dual-stage AI pipeline. First, a YOLO object detection model scans the image to identify teeth and isolate regions with anomalies (such as caries, cavities, gingivitis, or tartar). Second, a deep learning classification model analyzes the cropped tooth area to determine the severity classification (Mild, Moderate, Severe)."
    },
    {
      q: "What types of images can I upload?",
      a: "The system is trained to process standard oral photography, intraoral scans, and dental X-rays. For optimal detection performance, ensure the image is well-lit and clear."
    },
    {
      q: "Is DENTEX a replacement for a dentist?",
      a: "No. DENTEX is designed as an AI-powered helper tool for screening and education. It does not replace professional clinical examinations. All diagnoses and treatment plans should be verified by a certified dental professional."
    },
    {
      q: "How secure is my data?",
      a: "All uploaded images and prediction details are secured using JWT-based token authorization. Your scans are tied directly to your profile and are not publicly accessible."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-b from-brand-50/70 via-transparent to-transparent dark:from-brand-950/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100/80 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 mb-6 border border-brand-200/40 dark:border-brand-850/20">
              <Cpu size={12} className="animate-spin" />
              <span>Next-Gen Dental AI Screening</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-slate-900 dark:text-white font-sans">
              Instant Dental Disease <br />
              <span className="bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-cyan-300">
                Detection & Grading
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Upload oral scans or X-ray images to detect anomalies, analyze disease severity, and generate professional clinician next-step reports in seconds.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/dashboard"
                className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-brand-400 hover:shadow-xl hover:shadow-brand-500/30 transition-all duration-300"
              >
                Get Started for Free
              </Link>
              <a href="#about" className="text-sm font-semibold leading-6 text-slate-800 dark:text-slate-350 flex items-center gap-1 hover:underline">
                Learn how it works <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI Overview / How it Works */}
      <section id="about" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-bold leading-7 text-brand-600 dark:text-brand-400">Innovative Technology</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Double-Stage Diagnostic Pipeline
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Our advanced machine learning framework automates dental checks in sequential stages to ensure highly accurate, explainable severity outputs.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              
              <div className="flex flex-col items-center text-center glass-card p-8 rounded-2xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/25">
                  <Activity size={24} />
                </div>
                <dt className="text-lg font-bold leading-7 text-slate-950 dark:text-white">
                  1. YOLOv11 Detection
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                  <p className="flex-auto">
                    The YOLO algorithm scans coordinates and locates teeth and individual lesions including Caries, Cavities, Gingivitis, and Tartar.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col items-center text-center glass-card p-8 rounded-2xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-md shadow-cyan-500/25">
                  <Cpu size={24} />
                </div>
                <dt className="text-lg font-bold leading-7 text-slate-950 dark:text-white">
                  2. Severity Grading
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                  <p className="flex-auto">
                    The detected region is automatically cropped and passed to our ResNet classifier to categorize severity levels: Mild, Moderate, or Severe.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col items-center text-center glass-card p-8 rounded-2xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
                  <ShieldAlert size={24} />
                </div>
                <dt className="text-lg font-bold leading-7 text-slate-950 dark:text-white">
                  3. Quality Check & Reports
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                  <p className="flex-auto">
                    Algorithms assess focus blur and illumination values, flag low quality, recommend steps, and generate PDF clinical reports.
                  </p>
                </dd>
              </div>

            </dl>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-bold leading-7 text-brand-600 dark:text-brand-400">Platform Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              End-to-End Dental Management
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {[
                { title: "Real-time Diagnostics", desc: "Drag & drop images or use device camera capture to execute analysis in under 2 seconds.", icon: Heart },
                { title: "Dashboard Analytics", desc: "Visual charts for disease ratios, tracking accuracy metrics, and weekly case growth logs.", icon: BarChart3 },
                { title: "PDF Report Downloads", desc: "Instantly compile patient scan visual records and AI annotations into printable diagnostic documents.", icon: CheckCircle2 },
                { title: "Safe & Encrypted Databases", desc: "JWT tokens and bcrypt configurations secure personal patient files and logs from unwanted access.", icon: Database }
              ].map((feat, index) => (
                <div key={index} className="relative pl-16">
                  <dt className="text-base font-bold leading-7 text-slate-900 dark:text-white">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white">
                      <feat.icon size={20} />
                    </div>
                    {feat.title}
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{feat.desc}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Statistics */}
      <section id="stats" className="py-20 bg-slate-900 text-white relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-y-16 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-sm font-semibold leading-7 text-slate-300">Total Scans Evaluated</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">45,000+</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-sm font-semibold leading-7 text-slate-300">YOLO Detection Accuracy</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-brand-400 sm:text-5xl">97.8%</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-sm font-semibold leading-7 text-slate-300">Average Inference Latency</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-cyan-400 sm:text-5xl">1.8s</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faq" className="py-24 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-bold leading-7 text-brand-600 dark:text-brand-400">Got Questions?</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-3xl space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-200 dark:border-slate-800 pb-6">
                <dt className="text-base font-bold text-slate-900 dark:text-white">{faq.q}</dt>
                <dd className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-6">{faq.a}</dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-slate-950 py-12 text-slate-500 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 flex items-center justify-center bg-brand-500 text-white rounded-lg font-bold">D</div>
            <span className="text-sm font-semibold text-white">DENTEX AI</span>
          </div>
          <p className="text-xs">&copy; 2026 DENTEX Platform. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
