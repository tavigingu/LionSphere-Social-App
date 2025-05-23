// import {
//   createBrowserRouter,
//   RouterProvider,
//   Navigate,
// } from "react-router-dom";
// //import App from "./App";
// import AuthPage from "./pages/AuthPage.tsx";
// import HomePage from "./pages/HomePage.tsx";
// import ProfilePage from "./pages/ProfilePage.tsx";
// import ChatPage from "./pages/ChatPage.tsx";
// import LocationExplore from "./components/Explore/LoctationExplore.tsx";
// import TagExplore from "./components/Explore/TagExplore.tsx";
// import StatisticsPage from "./pages/StatisticsPage.tsx";
// import AboutPage from "./pages/AboutPage.tsx";
// import PrivacyPolicyPage from "./pages/PirvacyPoliticsPage.tsx";
// import TermsOfServicePage from "./pages/TermsOfServicePage.tsx";
// import ContactPage from "./pages/ContactPage.tsx";
// import AdminStatisticsPage from "./pages/AdminStatisticsPage.tsx";
// import AdminUsersPage from "./pages/AdminUsersPage.tsx";
// import AdminReportsPage from "./pages/AdminReportsPage.tsx";
// import AdminReportedPostsPage from "./pages/AdminReportedPosts.tsx";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Navigate to="/login" replace />,
//   },
//   {
//     path: "/login",
//     element: <AuthPage />,
//   },
//   {
//     path: "/home",
//     element: <HomePage />,
//   },
//   {
//     path: "/profile",
//     element: <ProfilePage />,
//   },
//   {
//     path: "/profile/:userId",
//     element: <ProfilePage />,
//   },
//   {
//     path: "/chat",
//     element: <ChatPage />, // New chat route
//   },
//   {
//     path: "/explore/location/:locationName",
//     element: <LocationExplore />,
//   },
//   {
//     path: "/explore/tag/:tagName",
//     element: <TagExplore />,
//   },
//   {
//     path: "/statistics",
//     element: <StatisticsPage />, // Noua rută pentru pagina de statistici
//   },
//   {
//     path: "/about",
//     element: <AboutPage />, // Noua rută pentru pagina de statistici
//   },
//   {
//     path: "/privacy",
//     element: <PrivacyPolicyPage />, // Noua rută pentru pagina de statistici
//   },
//   {
//     path: "/terms",
//     element: <TermsOfServicePage />, // Noua rută pentru pagina de statistici
//   },
//   {
//     path: "/contact",
//     element: <ContactPage />, // Noua rută pentru pagina de statistici
//   },
//   {
//     path: "/admin/statistics",
//     element: <AdminStatisticsPage />, // New admin statistics route
//   },
//   {
//     path: "/admin/users",
//     element: <AdminUsersPage />, // New admin statistics route
//   },
//   {
//     path: "/admin/reports",
//     element: <AdminReportsPage />, // New admin statistics route
//   },
//   {
//     path: "/admin/reported-posts",
//     element: <AdminReportedPostsPage />, // New admin statistics route
//   },
//   {
//     path: "/admin/profile/:userId",
//     element: <ProfilePage />,
//   },
// ]);

// const Router = () => <RouterProvider router={router} />;

// export default Router;
// frontend/src/Router.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import LocationExplore from "./components/Explore/LoctationExplore.tsx";
import TagExplore from "./components/Explore/TagExplore.tsx";
import StatisticsPage from "./pages/StatisticsPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import PrivacyPolicyPage from "./pages/PirvacyPoliticsPage.tsx";
import TermsOfServicePage from "./pages/TermsOfServicePage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import AdminStatisticsPage from "./pages/AdminStatisticsPage.tsx";
import AdminUsersPage from "./pages/AdminUsersPage.tsx";
import AdminReportsPage from "./pages/AdminReportsPage.tsx";
import AdminReportedPostsPage from "./pages/AdminReportedPosts.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import PublicTimelinePage from "./pages/PublicTimelinePage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicTimelinePage />, // Default to public timeline
  },
  {
    path: "/login",
    element: (
      <ProtectedRoute requireAuth={false}>
        <AuthPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/:userId",
    element: (
     // <ProtectedRoute>
        <ProfilePage />
      //</ProtectedRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/explore/location/:locationName",
    element: (
     // <ProtectedRoute>
        <LocationExplore />
      //</ProtectedRoute>
    ),
  },
  {
    path: "/explore/tag/:tagName",
    element: (
      // <ProtectedRoute>
      <TagExplore />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/statistics",
    element: (
      <ProtectedRoute>
        <StatisticsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/about",
    element: <AboutPage />, // Public page
  },
  {
    path: "/privacy",
    element: <PrivacyPolicyPage />, // Public page
  },
  {
    path: "/terms",
    element: <TermsOfServicePage />, // Public page
  },
  {
    path: "/contact",
    element: <ContactPage />, // Public page
  },
  {
    path: "/admin/statistics",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminStatisticsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminUsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminReportsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/reported-posts",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminReportedPostsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/profile/:userId",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
