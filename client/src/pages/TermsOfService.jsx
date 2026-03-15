import React from 'react'

const TermsOfService = () => {
  return (
    <section className="bg-brand-cream min-h-screen py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-primary mb-8 border-b-2 border-brand-secondary pb-4">
          Terms of Use
        </h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
          <p>
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the KIEL HELMET SHOP website, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on KIEL HELMET SHOP's website for personal, non-commercial transitory viewing only.
            </p>
            <p className="mt-2 text-sm italic">
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Modify or copy the materials.</li>
              <li>Use the materials for any commercial purpose or for any public display.</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website.</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">3. Disclaimer</h2>
            <p>
              The materials on KIEL HELMET SHOP's website are provided on an 'as is' basis. KIEL HELMET SHOP makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">4. Limitations</h2>
            <p>
              In no event shall KIEL HELMET SHOP or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on KIEL HELMET SHOP's website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">5. Product Accuracy</h2>
            <p>
              The materials appearing on KIEL HELMET SHOP's website could include technical, typographical, or photographic errors. KIEL HELMET SHOP does not warrant that any of the materials on its website are accurate, complete or current. We may make changes to the materials contained on our website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">6. Links</h2>
            <p>
              KIEL HELMET SHOP has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by KIEL HELMET SHOP of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">7. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of our operating jurisdiction and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-2 font-medium">
              Email: support@kielhelmet.shop
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

export default TermsOfService
