import React from "react";
import { motion } from "framer-motion";
import { FaGavel, FaUserCheck } from "react-icons/fa";

const TermsOfServicePage: React.FC = () => {
  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation for header
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Section */}
      <motion.section
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="w-full bg-gradient-to-r from-purple-700 to-blue-600 text-white py-20 flex flex-col items-center justify-center relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-blue-800 opacity-20 z-0" />
        <h1 className="text-5xl md:text-7xl font-extrabold text-center z-10">
          Terms of Service
        </h1>
        <p className="text-lg md:text-xl mt-4 max-w-2xl text-center z-10 px-4">
          Welcome to LionSphere! These terms outline how you can use our
          platform and what we expect from our community.
        </p>
      </motion.section>

      {/* Main Content */}
      <section className="w-full max-w-4xl mx-auto py-16 px-4 md:px-8">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-4">
            <FaGavel className="text-purple-500 text-2xl mr-3" />
            <h2 className="text-3xl font-semibold text-gray-800">
              Introduction
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            These Terms of Service (“Terms”) govern your use of LionSphere,
            including features like Feed, Profiles, Posts, Stories, Chat,
            Notifications, Search, and Discovery. By accessing or using our
            platform, you agree to these Terms and our{" "}
            <a href="/privacy" className="text-blue-500 hover:underline">
              Privacy Policy
            </a>
            . If you don’t agree, please don’t use our services.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Last updated: April 13, 2025
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-4">
            <FaUserCheck className="text-blue-500 text-2xl mr-3" />
            <h2 className="text-3xl font-semibold text-gray-800">
              Account Responsibilities
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            To use our platform, you must:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>Be at least 13 years old (or 16 in some regions).</li>
            <li>Provide accurate information when creating your Profile.</li>
            <li>Keep your login credentials secure and not share them.</li>
            <li>
              Notify us at{" "}
              <a
                href="mailto:support@lionsphere.com"
                className="text-blue-500 hover:underline"
              >
                support@lionsphere.com
              </a>{" "}
              if you suspect unauthorized account access.
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            You are responsible for all activity on your account, including
            Posts, Stories, and Chat messages.
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            User Content
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You own the content you create (Posts, Stories, comments, messages),
            but by sharing it, you grant us a non-exclusive, worldwide,
            royalty-free license to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>
              Display it on our platform (e.g., in Feed, Search, or Discovery).
            </li>
            <li>
              Store and process it to provide our services (e.g., applying
              filters to Stories).
            </li>
            <li>Use it in anonymized form for analytics or improvements.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            Public content (e.g., Posts or Stories not set to private) may be
            visible to others, including hashtags and locations. You can delete
            your content at any time, but copies may remain in backups or with
            users who saved it (e.g., screenshots).
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Acceptable Use
          </h2>
          <p className="text-gray-600 leading-relaxed">
            To keep our community safe, you agree not to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>
              Post or share illegal, harmful, or offensive content (e.g., hate
              speech, nudity, violence).
            </li>
            <li>
              Spam, scam, or mislead users (e.g., fake Profiles or phishing).
            </li>
            <li>
              Violate others’ rights, including intellectual property (e.g.,
              sharing copyrighted images without permission).
            </li>
            <li>
              Use automated tools to scrape data or manipulate likes/followers.
            </li>
            <li>
              Interfere with our services (e.g., hacking, overloading servers).
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            We may remove content or suspend accounts that violate these rules,
            and we may report illegal activity to authorities.
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Termination
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You can delete your account at any time via your Profile settings.
            We may suspend or terminate your account if you:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>Violate these Terms or our Privacy Policy.</li>
            <li>Engage in harmful behavior, as determined by us.</li>
            <li>Fail to verify your identity if requested.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            Upon termination, your access to Feed, Chat, and other features will
            end, but some content (e.g., public Posts) may remain visible.
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Intellectual Property
          </h2>
          <p className="text-gray-600 leading-relaxed">
            LionSphere owns the platform, including its design, code, and
            branding. You may not copy, modify, or distribute our services
            without permission. If you believe content on our platform infringes
            your copyright, contact us at {}
            <a
              href="mailto:support@lionsphere.com"
              className="text-blue-500 hover:underline"
            >
              support@lionsphere.com
            </a>
            .
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Limitation of Liability
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We provide our services “as is.” We’re not responsible for:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>Content posted by users (e.g., offensive Posts or Stories).</li>
            <li>Loss of data, access, or profits from using our platform.</li>
            <li>Issues caused by third parties (e.g., internet outages).</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            To the extent permitted by law, our liability is limited to the
            maximum extent allowed.
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Changes to These Terms
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We may update these Terms to reflect new features or legal
            requirements. We’ll notify you via email or in-app alerts for
            significant changes. Continued use of our platform means you accept
            the updated Terms.
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Questions about these Terms? Reach out at{" "}
            <a
              href="mailto:support@lionsphere.com"
              className="text-blue-500 hover:underline"
            >
              support@lionsphere.com
            </a>{" "}
            or visit our{" "}
            <a href="/contact" className="text-blue-500 hover:underline">
              Contact
            </a>{" "}
            page.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-12 flex flex-col items-center">
        <p className="text-sm mb-4">
          © {new Date().getFullYear()} LionSphere. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <a
            href="/about"
            className="text-sm hover:text-purple-400 transition-colors"
          >
            About
          </a>
          <a
            href="/privacy"
            className="text-sm hover:text-purple-400 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-sm hover:text-purple-400 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/contact"
            className="text-sm hover:text-purple-400 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfServicePage;
