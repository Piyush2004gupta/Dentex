import React, { useEffect } from 'react';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 font-sans">
            Terms and Conditions
          </h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
            <p className="text-lg leading-relaxed">
              Welcome to SmileGuard. Please review the following Terms and Conditions carefully. These terms govern your use of our website, application, services, and technologies managed by HOPELABSAI Solution Private Limited.
            </p>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using the SmileGuard application, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use or access the services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Image Data Storage and Usage Policy</h2>
              <p className="leading-relaxed">
                By using the scanning features (either uploading an image or using the camera), you explicitly consent to allow HOPELABSAI Solution Private Limited to securely store and utilize your uploaded/captured images. This data will be used to run real-time analysis, display your personal scan history, and train, test, and improve our artificial intelligence and machine learning models for higher efficiency and accuracy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. No Medical Advice Disclaimer</h2>
              <p className="leading-relaxed">
                The content and analysis provided by SmileGuard are for informational and educational purposes only. It is not, and is not intended to be, a substitute for professional healthcare, dental analysis, or treatment. Always seek the advice of a qualified dentist or other healthcare providers with any questions regarding a dental condition. Never disregard professional guidance or delay in seeking it because of something you have read on this application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. User Accounts and Security</h2>
              <p className="leading-relaxed">
                To access certain features of the service, you must create a registered account. You are solely responsible for maintaining the confidentiality of your account credentials (username, password, phone number) and for all activities that occur under your account. You must notify us immediately of any unauthorized use or security breach.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content, features, logos, graphics, user interface designs, and backend algorithms used in the SmileGuard application are the exclusive property of HOPELABSAI Solution Private Limited and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Limitation of Liability</h2>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, HOPELABSAI Solution Private Limited and its directors, employees, or agents shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use of, or inability to use, this application or the analysis results provided.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Modifications to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to revise these Terms and Conditions at any time without prior notice. By continuing to use the service after amendments are published, you agree to accept and abide by the updated terms.
              </p>
            </section>

            <div className="pt-8 mt-8 border-t border-slate-100">
              <p className="leading-relaxed">
                If you have any questions or concerns regarding these Terms and Conditions, please contact us at{' '}
                <a href="mailto:support@hopelabsai.com" className="text-brand-600 font-semibold hover:underline">
                  support@hopelabsai.com
                </a>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default TermsPage;