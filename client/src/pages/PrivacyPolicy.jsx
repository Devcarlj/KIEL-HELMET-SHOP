import React from 'react'

const PrivacyPolicy = () => {
  return (
    <section className="bg-brand-cream min-h-screen py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-primary mb-8 border-b-2 border-brand-secondary pb-4">
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
          <p>
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">1. Introduction</h2>
            <p>
              Welcome to KIEL HELMET SHOP. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">2. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, or when you participate in activities on the website.
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Personal Data: Name, email address, postal address, phone number.</li>
              <li>Payment Data: Payment instrument details (processed securely by our payment partners).</li>
              <li>Social Media Login Data: Information from social media accounts if you choose to link them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">3. How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Process and fulfill your orders.</li>
              <li>Improve our website and customer service.</li>
              <li>Send you marketing communications (you can opt-out at any time).</li>
              <li>Protect our services and users from fraud or security threats.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">4. Information Sharing</h2>
            <p>
              We do not sell, rent, or lease your personal information to third parties. We may share data with trusted partners to help perform statistical analysis, send you email or postal mail, provide customer support, or arrange for deliveries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">5. Data Security</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">6. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, or delete your personal data. You can manage your account settings or contact us directly to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-primary mb-3">7. Contact Us</h2>
            <p>
              If you have questions or comments about this policy, you may contact us at:
            </p>
            <div className="mt-2 font-medium">
              Email: support@kielhelmet.shop<br />
              Address: B24 L12 A. Bonifacio St, Phase 1, Cherry Homes, Mambog 1, Bacoor, Cavite, Philippines
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

export default PrivacyPolicy
