import React, { useRef } from "react";
import {
  FaHeart,
  FaCamera,
  FaComment,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

const About: React.FC = () => {
  // Scroll-based parallax for hero
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityParallax = useTransform(scrollY, [0, 400], [1, 0.5]);

  // Feature section animations
  const featureVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // Icon animation variants
  const iconVariants = {
    initial: { opacity: 0, y: 20, x: 20 },
    animate: {
      opacity: 0.2,
      y: [-10, 10], // Gentle floating up/down
      x: [-5, 5], // Subtle left/right drift
      transition: {
        opacity: { duration: 0.5 },
        y: { repeat: Infinity, repeatType: "reverse", duration: 3 },
        x: { repeat: Infinity, repeatType: "reverse", duration: 4 },
      },
    },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  };

  // CTA animation
  const ctaVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
  };

  // Refs for each feature section to track visibility
  const sectionRefs = {
    feed: useRef<HTMLDivElement>(null),
    profiles: useRef<HTMLDivElement>(null),
    posts: useRef<HTMLDivElement>(null),
    stories: useRef<HTMLDivElement>(null),
    connect: useRef<HTMLDivElement>(null),
    chat: useRef<HTMLDivElement>(null),
    notifications: useRef<HTMLDivElement>(null),
    search: useRef<HTMLDivElement>(null),
    discovery: useRef<HTMLDivElement>(null),
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Hero Section */}
      <motion.section
        style={{ y: heroParallax, opacity: opacityParallax }}
        className="relative h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-blue-600 text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-blue-800 opacity-30 z-0" />
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-7xl md:text-9xl font-extrabold text-center z-10 uppercase tracking-tight"
        >
          Connect.
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-7xl md:text-9xl font-extrabold text-center z-10 uppercase tracking-tight"
        >
          Share.
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-7xl md:text-9xl font-extrabold text-center z-10 uppercase tracking-tight"
        >
          Discover.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-xl md:text-2xl mt-6 max-w-3xl text-center z-10"
        >
          Your world, connected. A platform to share stories, spark
          conversations, and find your community.
        </motion.p>
      </motion.section>

      {/* Features Section - Full-Screen Dynamic Flow */}
      <section className="relative">
        {/* Feed */}
        <motion.div
          ref={sectionRefs.feed}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featureVariants}
          className="min-h-screen flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-gradient-to-r from-gray-100 to-gray-200 relative"
        >
          <div className="md:w-1/2 z-10">
            <h2 className="text-6xl md:text-8xl font-extrabold text-purple-600 mb-4">
              Feed
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-md">
              Scroll through a personalized timeline of posts from people you
              love. Like, save, and dive in with infinite scrolling.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="md:w-1/2 mt-8 md:mt-0 z-10"
          >
            <AnimatePresence>
              <motion.div
                key="feed-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-purple-500 text-9xl absolute right-10 top-20 pointer-events-none"
              >
                <FaHeart />
              </motion.div>
            </AnimatePresence>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto">
              <p className="text-gray-600 italic">“Loving the vibe!”</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Profiles */}
        <motion.div
          ref={sectionRefs.profiles}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featureVariants}
          className="min-h-screen flex flex-col md:flex-row-reverse items-center justify-between px-8 py-20 bg-gradient-to-l from-blue-100 to-gray-100 relative"
        >
          <div className="md:w-1/2 z-10">
            <h2 className="text-6xl md:text-8xl font-extrabold text-blue-600 mb-4">
              Profiles
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-md">
              Show the world who you are. Customize your profile with stats,
              social links, and stunning visuals.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="md:w-1/2 mt-8 md:mt-0 z-10"
          >
            <AnimatePresence>
              <motion.div
                key="profiles-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-blue-500 text-9xl absolute left-10 top-20 pointer-events-none"
              >
                <FaUserPlus />
              </motion.div>
            </AnimatePresence>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto">
              <p className="text-gray-600 italic">“Made my profile pop!”</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Posts */}
        <motion.div
          ref={sectionRefs.posts}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featureVariants}
          className="min-h-screen flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-gradient-to-r from-purple-100 to-gray-100 relative"
        >
          <div className="md:w-1/2 z-10">
            <h2 className="text-6xl md:text-8xl font-extrabold text-purple-600 mb-4">
              Posts
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-md">
              Create moments with images, tags, and hashtags. Comment, reply,
              and save your favorites.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="md:w-1/2 mt-8 md:mt-0 z-10"
          >
            <AnimatePresence>
              <motion.div
                key="posts-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-purple-500 text-9xl absolute right-10 top-20 pointer-events-none"
              >
                <FaCamera />
              </motion.div>
            </AnimatePresence>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto">
              <p className="text-gray-600 italic">“My posts are 🔥!”</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Stories */}
        <motion.div
          ref={sectionRefs.stories}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featureVariants}
          className="min-h-screen flex flex-col md:flex-row-reverse items-center justify-between px-8 py-20 bg-gradient-to-l from-blue-100 to-gray-100 relative"
        >
          <div className="md:w-1/2 z-10">
            <h2 className="text-6xl md:text-8xl font-extrabold text-blue-600 mb-4">
              Stories
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-md">
              Share fleeting moments with filters and flair. Watch stories in a
              carousel and see who’s tuned in.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="md:w-1/2 mt-8 md:mt-0 z-10"
          >
            <AnimatePresence>
              <motion.div
                key="stories-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-blue-500 text-9xl absolute left-10 top-20 pointer-events-none"
              >
                <FaCamera />
              </motion.div>
            </AnimatePresence>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto">
              <p className="text-gray-600 italic">“Stories are so fun!”</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Social Interactions */}
        <motion.div
          ref={sectionRefs.connect}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featureVariants}
          className="min-h-screen flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-gradient-to-r from-purple-100 to-gray-100 relative"
        >
          <div className="md:w-1/2 z-10">
            <h2 className="text-6xl md:text-8xl font-extrabold text-purple-600 mb-4">
              Connect
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-md">
              Follow, like, tag, and mention. Build your network and stay close
              with your community.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="md:w-1/2 mt-8 md:mt-0 z-10"
          >
            <AnimatePresence>
              <motion.div
                key="connect-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-purple-500 text-9xl absolute right-10 top-20 pointer-events-none"
              >
                <FaUserPlus />
              </motion.div>
            </AnimatePresence>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto">
              <p className="text-gray-600 italic">“Found my tribe!”</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Realtime Chat */}
        <motion.div
          ref={sectionRefs.chat}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featureVariants}
          className="min-h-screen flex flex-col md:flex-row-reverse items-center justify-between px-8 py-20 bg-gradient-to-l from-blue-100 to-gray-100 relative"
        >
          <div className="md:w-1/2 z-10">
            <h2 className="text-6xl md:text-8xl font-extrabold text-blue-600 mb-4">
              Chat
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-md">
              Message in real-time with typing indicators, read receipts, and
              image sharing. Stay connected.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="md:w-1/2 mt-8 md:mt-0 z-10"
          >
            <AnimatePresence>
              <motion.div
                key="chat-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-blue-500 text-9xl absolute left-10 top-20 pointer-events-none"
              >
                <FaComment />
              </motion.div>
            </AnimatePresence>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto">
              <p className="text-gray-600 italic">“Chatting is seamless!”</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          ref={sectionRefs.notifications}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featureVariants}
          className="min-h-screen flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-gradient-to-r from-purple-100 to-gray-100 relative"
        >
          <div className="md:w-1/2 z-10">
            <h2 className="text-6xl md:text-8xl font-extrabold text-purple-600 mb-4">
              Stay Notified
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-md">
              Get real-time alerts for likes, comments, and new followers. Never
              miss a moment.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="md:w-1/2 mt-8 md:mt-0 z-10"
          >
            <AnimatePresence>
              <motion.div
                key="notifications-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-purple-500 text-9xl absolute right-10 top-20 pointer-events-none"
              >
                <FaHeart />
              </motion.div>
            </AnimatePresence>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto">
              <p className="text-gray-600 italic">“Always in the loop!”</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.div
          ref={sectionRefs.search}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featureVariants}
          className="min-h-screen flex flex-col md:flex-row-reverse items-center justify-between px-8 py-20 bg-gradient-to-l from-blue-100 to-gray-100 relative"
        >
          <div className="md:w-1/2 z-10">
            <h2 className="text-6xl md:text-8xl font-extrabold text-blue-600 mb-4">
              Search
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-md">
              Find users, hashtags, and locations with ease. Explore content
              that sparks your interest.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="md:w-1/2 mt-8 md:mt-0 z-10"
          >
            <AnimatePresence>
              <motion.div
                key="search-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-blue-500 text-9xl absolute left-10 top-20 pointer-events-none"
              >
                <FaSearch />
              </motion.div>
            </AnimatePresence>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto">
              <p className="text-gray-600 italic">
                “Found exactly what I wanted!”
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Discovery */}
        <motion.div
          ref={sectionRefs.discovery}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featureVariants}
          className="min-h-screen flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-gradient-to-r from-purple-100 to-gray-100 relative"
        >
          <div className="md:w-1/2 z-10">
            <h2 className="text-6xl md:text-8xl font-extrabold text-purple-600 mb-4">
              Discover
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-md">
              Meet new people, explore trending hashtags, and uncover posts from
              unique locations.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="md:w-1/2 mt-8 md:mt-0 z-10"
          >
            <AnimatePresence>
              <motion.div
                key="discovery-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-purple-500 text-9xl absolute right-10 top-20 pointer-events-none"
              >
                <FaSearch />
              </motion.div>
            </AnimatePresence>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto">
              <p className="text-gray-600 italic">“So much to explore!”</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <motion.section
        variants={ctaVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-blue-600 text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-blue-800 opacity-30 z-0" />
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-center z-10"
        >
          Your Story Starts Here
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mt-4 max-w-2xl text-center z-10"
        >
          Join a global community. Share your moments. Find your vibe.
        </motion.p>
        <motion.a
          href="/signup"
          whileHover={{
            scale: 1.1,
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 bg-white text-purple-600 font-semibold py-4 px-10 rounded-full z-10"
        >
          Get Started
        </motion.a>
      </motion.section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-12 flex flex-col items-center">
        <p className="text-sm mb-4">
          © {new Date().getFullYear()} LionSphere. All rights reserved.
        </p>
        <div className="flex space-x-6">
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

export default About;