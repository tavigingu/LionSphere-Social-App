import { createBrowserRouter, RouterProvider } from "react-router-dom";
//import App from "./App";
import AuthPage from "./pages/AuthPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import LocationExplore from "./components/Explore/LoctationExplore.tsx";
import TagExplore from "./components/Explore/TagExplore.tsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/profile/:userId",
    element: <ProfilePage />,
  },
  {
    path: "/chat",
    element: <ChatPage />, // New chat route
  },
  {
    path: "/explore/location/:locationName",
    element: <LocationExplore />,
  },
  {
    path: "/explore/tag/:tagName",
    element: <TagExplore />,
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
