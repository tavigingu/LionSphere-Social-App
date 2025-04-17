import React from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa";

const ContactPage: React.FC = () => {
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

  // Animation for social icons
  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2, rotate: 5, transition: { duration: 0.3 } },
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
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-extrabold text-center z-10"
        >
          Join the LionSphere Vibe
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl mt-4 max-w-2xl text-center z-10 px-4"
        >
          Ready to roar with us? Connect with LionSphere’s global community and
          spark something epic!
        </motion.p>
      </motion.section>

      {/* Main Content */}
      <section className="w-full max-w-4xl mx-auto py-16 px-4 md:px-8">
        {/* Connect with Us */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-4">
            <FaGlobe className="text-purple-500 text-2xl mr-3" />
            <h2 className="text-3xl font-semibold text-gray-800">
              Where to Find Us
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            LionSphere isn’t just an app—it’s a movement. Whether you’re sharing
            stories, chasing inspiration, or building connections, we’re right
            there with you. Catch us at these spots to stay in the loop and join
            the pride!
          </p>
          <ul className="text-gray-600 mt-6 space-y-4">
            <li className="flex items-center">
              <FaEnvelope className="text-purple-500 mr-2 text-xl" />
              <span>
                Drop us a line at{" "}
                <a
                  href="mailto:support@lionsphere.com"
                  className="text-blue-500 hover:underline font-medium"
                >
                  support@lionsphere.com
                </a>{" "}
                —we’re all ears for your ideas, questions, or just a friendly
                roar!
              </span>
            </li>
            <li>
              Got a quick question? Check our{" "}
              <a
                href="/faq"
                className="text-blue-500 hover:underline font-medium"
              >
                FAQ
              </a>{" "}
              for the fastest way to dive into the LionSphere experience.
            </li>
          </ul>
        </motion.div>

        {/* Social Media Buzz */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <div className="flex items-center mb-4">
            <FaInstagram className="text-blue-500 text-2xl mr-3" />
            <h2 className="text-3xl font-semibold text-gray-800">
              Feel the Pulse
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            LionSphere’s community is buzzing, and we’re sharing the energy
            everywhere! Follow us to catch exclusive updates, behind-the-scenes
            magic, and a whole lot of inspiration. Let’s create something
            legendary together.
          </p>
          <div className="flex flex-wrap gap-6 mt-6">
            <motion.a
              href="https://instagram.com/lionsphere"
              target="_blank"
              rel="noopener noreferrer"
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              className="text-purple-500 hover:text-purple-600"
            >
              <FaInstagram className="text-4xl" />
              <span className="block text-sm mt-1 text-gray-600">
                Instagram
              </span>
            </motion.a>
            <motion.a
              href="https://twitter.com/lionsphere"
              target="_blank"
              rel="noopener noreferrer"
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              className="text-blue-500 hover:text-blue-600"
            >
              <FaTwitter className="text-4xl" />
              <span className="block text-sm mt-1 text-gray-600">Twitter</span>
            </motion.a>
            <motion.a
              href="https://linkedin.com/company/lionsphere"
              target="_blank"
              rel="noopener noreferrer"
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              className="text-blue-700 hover:text-blue-800"
            >
              <FaLinkedin className="text-4xl" />
              <span className="block text-sm mt-1 text-gray-600">LinkedIn</span>
            </motion.a>
          </div>
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

export default ContactPage;
