import React from "react";
import { motion } from "framer-motion";
import { FaLock, FaUserShield } from "react-icons/fa";

const PrivacyPolicyPage: React.FC = () => {
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
          Privacy Policy
        </h1>
        <p className="text-lg md:text-xl mt-4 max-w-2xl text-center z-10 px-4">
          Your trust matters. Learn how we protect your data and respect your
          privacy.
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
            <FaLock className="text-purple-500 text-2xl mr-3" />
            <h2 className="text-3xl font-semibold text-gray-800">
              Introduction
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            At LionSphere, we are committed to safeguarding your privacy. This
            Privacy Policy explains how we collect, use, share, and protect your
            personal information when you use our social media platform,
            including features like Feed, Profiles, Posts, Stories, Chat,
            Notifications, Search, and Discovery. By using our services, you
            agree to the terms outlined below.
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
            <FaUserShield className="text-blue-500 text-2xl mr-3" />
            <h2 className="text-3xl font-semibold text-gray-800">
              Information We Collect
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            We collect information to provide and improve our services. This
            includes:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>
              <strong>Profile Information:</strong> Username, email, profile
              picture, bio, social media links, and other details you provide.
            </li>
            <li>
              <strong>Content You Share:</strong> Posts, Stories, comments,
              replies, likes, and messages, including images, captions,
              hashtags, and location data.
            </li>
            <li>
              <strong>Interactions:</strong> Follows, likes, mentions, tags, and
              views of Stories or posts.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used (e.g.,
              Search, Discovery), time spent, and device information (e.g.,
              browser, OS).
            </li>
            <li>
              <strong>Communications:</strong> Messages sent via Chat, including
              text and images.
            </li>
          </ul>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            How We Use Your Information
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We use your information to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>Display your Feed with posts from followed users.</li>
            <li>Personalize Profiles and suggest connections in Discovery.</li>
            <li>
              Enable Posts and Stories creation with tags, hashtags, and
              locations.
            </li>
            <li>Facilitate Chat with real-time messaging and read receipts.</li>
            <li>
              Send Notifications for likes, comments, mentions, and followers.
            </li>
            <li>Power Search for users, hashtags, and locations.</li>
            <li>Analyze usage to improve features and fix issues.</li>
            <li>Ensure safety by detecting harmful content or behavior.</li>
          </ul>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Sharing Your Information
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We share your information only in these cases:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>
              <strong>Public Content:</strong> Posts, Stories, and comments you
              share publicly are visible to others, including hashtags and
              locations.
            </li>
            <li>
              <strong>Profile Visibility:</strong> Your username, profile
              picture, and bio are visible to users unless set to private.
            </li>
            <li>
              <strong>With Your Consent:</strong> When you tag or mention users,
              they see that content.
            </li>
            <li>
              <strong>Service Providers:</strong> We use trusted partners for
              hosting, analytics, and moderation, who follow strict privacy
              rules.
            </li>
            <li>
              <strong>Legal Requirements:</strong> If required by law or to
              protect our users, we may share data with authorities.
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            We do not sell your personal information.
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
            Your Choices and Rights
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You control your data. You can:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>Edit or delete your Profile, Posts, Stories, and comments.</li>
            <li>Make your account private to limit who sees your content.</li>
            <li>Disable Notifications or customize their frequency.</li>
            <li>Download your data, including Posts and messages.</li>
            <li>
              Request account deletion, which removes your data from our systems
              (subject to legal retention).
            </li>
            <li>
              Contact us at{" "}
              <a
                href="mailto:privacy@yourapp.com"
                className="text-blue-500 hover:underline"
              >
                privacy@yourapp.com
              </a>{" "}
              for data requests.
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            Depending on your region (e.g., EU, California), you may have
            additional rights under laws like GDPR or CCPA.
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
            Data Security
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We use industry-standard measures to protect your data, including
            encryption for Chat messages and secure storage for Profile details.
            However, no system is 100% secure, so we encourage strong passwords
            and caution with shared devices.
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
            Children’s Privacy
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Our services are not intended for users under 13 (or 16 in some
            regions). We do not knowingly collect data from children, and we
            remove such data if discovered.
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
            Changes to This Policy
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy to reflect new features or legal
            requirements. We’ll notify you via email or in-app alerts for
            significant changes. Check back here for the latest version.
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
            Questions about your privacy? Reach out at{" "}
            <a
              href="mailto:privacy@yourapp.com"
              className="text-blue-500 hover:underline"
            >
              privacy@lionsphere.com
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

export default PrivacyPolicyPage;
