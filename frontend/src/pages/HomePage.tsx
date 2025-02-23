// src/pages/Home.js
import React from "react";
import { useLocation } from "react-router-dom";
import Background from "../components/Background";
import ProfileSide from "../components/ProfileSide"; // Importă componenta

const Home: React.FC = () => {
  const location = useLocation();
  const user = location.state?.user; // Accesează datele utilizatorului

  if (!user) {
    return (
      <div className="relative min-h-screen text-white">
        <Background />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl">
            Nu sunt date disponibile despre utilizator.
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <Background />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <ProfileSide /> {/* Adaugă componenta ProfileSide */}
      </div>
    </div>
  );
};

export default Home;
