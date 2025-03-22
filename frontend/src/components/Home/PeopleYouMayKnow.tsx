import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/AuthStore";
import { IUser } from "../../types/AuthTypes";
import { getSuggestedUsers, followUser } from "../../api/User";

const PeopleYouMayKnow: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const suggestions = await getSuggestedUsers(user._id);
        setSuggestedUsers(suggestions);

        // Inițializăm stările pentru butoanele de follow
        const initialStatus: Record<string, boolean> = {};
        const initialLoading: Record<string, boolean> = {};
        suggestions.forEach((user) => {
          initialStatus[user._id] = false;
          initialLoading[user._id] = false;
        });
        setFollowingStatus(initialStatus);
        setFollowLoading(initialLoading);
      } catch (err) {
        console.error("Error fetching suggested users:", err);
        setError("Nu s-au putut încărca sugestiile");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [user]);

  const handleFollow = async (userId: string) => {
    if (!user) return;

    setFollowLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      await followUser(userId, user._id);

      // Actualizăm starea de follow
      setFollowingStatus((prev) => ({ ...prev, [userId]: true }));

      // Eliminăm utilizatorul din sugestii după un scurt delay pentru feedback vizual
      setTimeout(() => {
        setSuggestedUsers((prev) => prev.filter((user) => user._id !== userId));
      }, 1000);
    } catch (err) {
      console.error("Nu s-a putut urmări utilizatorul:", err);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Persoane pe care le poți cunoaște
        </h3>
        <div className="flex justify-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Persoane pe care le poți cunoaște
        </h3>
        <p className="text-red-300 text-center">{error}</p>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return null; // Nu afișăm componenta dacă nu există sugestii
  }

  return (
    <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Persoane pe care le poți cunoaște
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedUsers.map((suggestedUser) => (
            <div
              key={suggestedUser._id}
              className="flex flex-col items-center bg-white/5 backdrop-blur-sm p-4 rounded-lg"
            >
              <div
                className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer"
                onClick={() => navigateToProfile(suggestedUser._id)}
              >
                {suggestedUser.profilePicture ? (
                  <img
                    src={suggestedUser.profilePicture}
                    alt={`Profilul lui ${suggestedUser.username}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xl font-bold">
                    {suggestedUser.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="mt-3 text-center mb-3">
                <p
                  className="font-medium text-white text-base cursor-pointer hover:underline"
                  onClick={() => navigateToProfile(suggestedUser._id)}
                >
                  {suggestedUser.username}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  {suggestedUser.firstname} {suggestedUser.lastname}
                </p>
              </div>

              <button
                onClick={() => handleFollow(suggestedUser._id)}
                disabled={
                  followingStatus[suggestedUser._id] ||
                  followLoading[suggestedUser._id]
                }
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  followingStatus[suggestedUser._id]
                    ? "bg-green-500/50 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                } w-full max-w-[120px]`}
              >
                {followLoading[suggestedUser._id] ? (
                  <span className="flex items-center justify-center">
                    <div className="w-3 h-3 border-t-2 border-b-2 border-white rounded-full animate-spin mr-1"></div>
                    ...
                  </span>
                ) : followingStatus[suggestedUser._id] ? (
                  "Urmărești"
                ) : (
                  "Urmărește"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeopleYouMayKnow;
