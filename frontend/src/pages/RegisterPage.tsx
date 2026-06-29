import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Calendar, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Checkboxes
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentNotProfessionalAi, setConsentNotProfessionalAi] = useState(false);
  const [consentStoreImages, setConsentStoreImages] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!name || !email || !age || !phoneNo || !gender || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!consentTerms || !consentNotProfessionalAi || !consentStoreImages) {
      setError('You must agree to all terms, disclosures, and consent statements to register.');
      return;
    }

    setLoading(true);
    try {
      // derive username from email prefix
      const username = email.split('@')[0];
      await register({
        username,
        name,
        email,
        age: parseInt(age, 10),
        phone_no: phoneNo,
        gender,
        password,
        confirm_password: confirmPassword,
        consent_terms: consentTerms,
        consent_not_professional_ai: consentNotProfessionalAi,
        consent_store_images: consentStoreImages,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-500/10 dark:bg-brand-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/30 p-8 shadow-xl relative z-10 my-6">
        
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-cyan-300">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Register to analyze scans, view diagnostic histories, and receive clinical insights
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-800/20 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Email ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Age
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Calendar size={16} />
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Phone No */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Gender
              </label>
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 focus:border-brand-500 transition-all"
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Empty grid space for alignment in large screens */}
            <div className="hidden md:block"></div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/20">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Terms & Consents
            </h4>

            {/* Checkbox 1 */}
            <label className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                required
                checked={consentTerms}
                onChange={(e) => setConsentTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <span className="transition-colors">
                I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-brand-600 dark:text-brand-400 font-bold hover:underline">policy terms and conditions</button>.
              </span>
            </label>

            {/* Checkbox 2 */}
            <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                required
                checked={consentNotProfessionalAi}
                onChange={(e) => setConsentNotProfessionalAi(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <span className="group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors">
                This is a screening tool, not a professional healthcare AI-powered dental assistant.
              </span>
            </label>

            {/* Checkbox 3 */}
            <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                required
                checked={consentStoreImages}
                onChange={(e) => setConsentStoreImages(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <span className="group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors">
                I consent to allow HOPELABSAI Solution Private Limited to store and use my images to make AI more efficient.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-lg shadow-brand-500/10 hover:shadow-xl hover:shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserCheck size={16} />
            )}
            <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
          </button>

        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center border-t border-slate-200/50 dark:border-slate-800/20 pt-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>

      </div>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Terms & Conditions</h3>
              <button 
                type="button" 
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-5 text-slate-600 dark:text-slate-400 font-sans text-left">
              <p className="font-semibold text-slate-850 dark:text-slate-300">
                Effective Date: June 29, 2026
              </p>
              <p>
                Welcome to DENTEX, an AI-powered dental disease detection platform developed by <strong>HOPELABSAI Solution Private Limited</strong>. By registering an account and ticking the consent options, you agree to be bound by the following Terms & Conditions.
              </p>
              
              <h4 className="font-bold text-slate-900 dark:text-slate-200 pt-2 border-t border-slate-150 dark:border-slate-800/50">
                1. Disclaimer of Medical Advice
              </h4>
              <p>
                This clinical web application runs experimental computer vision models to screen and analyze dental diseases. The findings, crops, FDI tooth number mappings, and disease grading parameters are structured as reference diagnostics. <strong>This is a screening helper tool and does NOT replace professional healthcare checkups</strong>. All diagnoses, treatment paths, and interpretations must be verified by a certified, registered dental professional.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-200 pt-2 border-t border-slate-150 dark:border-slate-800/50">
                2. Image Storage and AI Efficiency Consent
              </h4>
              <p>
                You explicitly consent to allow HOPELABSAI Solution Private Limited to store and use uploaded images (oral scans, dental photographs, and X-rays) to execute prediction pipelines, save them in your account diagnostic logs, and reuse them for iterative dataset training. This consent helps refine classification weights to make our computer vision services more efficient and reliable.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-200 pt-2 border-t border-slate-150 dark:border-slate-800/50">
                3. User Account and Data Integrity
              </h4>
              <p>
                To access screening workflows, you must register a valid profile containing accurate demographics (Full Name, Age, Email ID, Phone No, Gender). You are solely responsible for all activities conducted under your user credentials.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-200 pt-2 border-t border-slate-150 dark:border-slate-800/50">
                4. Platform Warranties & Limitation of Liability
              </h4>
              <p>
                All materials, predictions, and software systems are provided on an "as-is" and "as-available" basis. HOPELABSAI Solution Private Limited disclaims all warranties of any kind and shall not be held liable for any clinical decisions made relying on our simulated or live deep-learning inference.
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-150 dark:border-slate-850 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setConsentTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all shadow shadow-brand-500/10"
              >
                Accept and Agree
              </button>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-250 dark:border-slate-750 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegisterPage;
