import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Importăm useLocation pentru a accesa datele din state
import { IUser } from "../types/authTypes"; // Importăm IUser pentru a folosi tipurile de date

const ProfileSide: React.FC = () => {
  const location = useLocation();
  const user = location.state?.user as IUser | undefined; // Accesăm utilizatorul din state
  const [userData, setUserData] = useState<IUser | null>(null); // Starea pentru datele utilizatorului

  // Actualizăm starea când se schimbă locația
  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  if (!userData) {
    return (
      <div className="w-full max-w-sm bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-6 border border-gray-800">
        <p className="text-white text-center">Încărcare...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm backdrop-blur-sm bg-white/5 rounded-2xl shadow-2xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-3xl">
      {/* Fundalul cu gradient roșu-albastru */}
      <div className="h-32 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-t-2xl" />

      {/* Detalii profil (nume și pseudonim) */}
      <div className="mt-4 text-center">
        {/* Imaginea profilului (plasată mai sus, pe jumătate peste gradient și pe jumătate peste card) */}
        <div className="relative -mt-12 flex justify-center">
          <div className="w-20 h-20 bg-white rounded-full border-2 border-green-500 flex items-center justify-center overflow-hidden animate-pulse-slow">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mt-4">
          {userData.username}
        </h2>
        <p className="text-sm text-gray-300">
          {userData.firstname} {userData.lastname}
        </p>

        {/* Statistici (Followers/Following) simple și albe */}
        <div className="flex justify-around mt-6 border-t border-gray-700 pt-4">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400">Followers</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {userData.followers.length}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400">Following</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {userData.following.length}
            </p>
          </div>
        </div>

        {/* Buton "My Profile" modern cu gradient */}
        <button className="mt-6 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white py-3 rounded-xl hover:from-orange-600 hover:via-amber-600 hover:to-red-600 transition-all duration-300 shadow-md">
          My Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileSide;
