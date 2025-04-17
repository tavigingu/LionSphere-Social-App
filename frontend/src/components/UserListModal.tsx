import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import { followUser, unfollowUser } from "../api/User";
import useAuthStore from "../store/AuthStore";
import { useNavigate } from "react-router-dom";

// Definim tipul de utilizator
interface User {
  _id: string;
  username: string;
  firstname?: string;
  lastname?: string;
  profilePicture?: string;
  following?: string[];
  followers?: string[];
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // "Likes", "Followers", or "Following"
  initialUsers?: User[];
  fetchUsers: (
    page: number,
    limit: number
  ) => Promise<{ users: User[]; hasMore: boolean }>;
  postId?: string;
  userId?: string;
}

const UserListModal: React.FC<UserListModalProps> = ({
  isOpen,
  onClose,
  title,
  initialUsers = [],
  fetchUsers,
  postId,
  userId,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});
  const [modalVisible, setModalVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  // Gestionează animațiile modalului
  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      const timer = setTimeout(() => {
        setListVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setListVisible(false);
      hasFetchedRef.current = false;
      const timer = setTimeout(() => {
        setModalVisible(false);
        // Resetăm starea când modalul se închide complet
        setUsers([]);
        setPage(1);
        setHasMore(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Încărcăm datele inițiale o singură dată când se deschide modalul
  useEffect(() => {
    if (isOpen && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadUsers();
    }
  }, [isOpen]);

  // Verificăm dacă lista are scroll
  useEffect(() => {
    if (listContainerRef.current) {
      const checkForScroll = () => {
        const element = listContainerRef.current;
        if (element) {
          setHasScroll(element.scrollHeight > element.clientHeight);
        }
      };

      // Verificăm inițial
      checkForScroll();

      // Și apoi la orice redimensionare sau schimbare a conținutului
      const resizeObserver = new ResizeObserver(checkForScroll);
      resizeObserver.observe(listContainerRef.current);

      return () => {
        if (listContainerRef.current) {
          resizeObserver.unobserve(listContainerRef.current);
        }
      };
    }
  }, [users, loading, isOpen]);

  // Gestionarea tastei Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // Click în afara modalului pentru închidere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Configurare observator pentru scroll infinit
  const lastUserElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreUsers();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Inițializează starea de following pentru toți utilizatorii
  useEffect(() => {
    if (!currentUser || users.length === 0) return;

    const initialStatus: Record<string, boolean> = {};
    users.forEach((user) => {
      // Verificăm dacă utilizatorul curent urmărește fiecare utilizator din listă
      initialStatus[user._id] =
        currentUser.following?.includes(user._id) || false;
    });
    setFollowingStatus(initialStatus);
  }, [users, currentUser]);

  // Încarcă utilizatorii inițiali
  const loadUsers = async () => {
    if (loading) return;

    setLoading(true);
    try {
      console.log("Loading users...");
      const result = await fetchUsers(1, 20);
      console.log("Users loaded:", result.users.length);
      setUsers(result.users);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Încarcă mai mulți utilizatori la scroll
  const loadMoreUsers = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await fetchUsers(nextPage, 20);

      setUsers((prevUsers) => [...prevUsers, ...result.users]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading more users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gestionează follow/unfollow
  const handleFollowToggle = async (
    targetUserId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Previne propagarea click-ului către elementul părinte
    if (!currentUser) return;

    if (followLoading[targetUserId]) return;

    setFollowLoading((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      const isFollowing = followingStatus[targetUserId];

      if (isFollowing) {
        await unfollowUser(targetUserId, currentUser._id);
        // Actualizează starea globală
        useAuthStore.getState().updateUserProfile({
          ...currentUser,
          following: currentUser.following.filter((id) => id !== targetUserId),
        });
      } else {
        await followUser(targetUserId, currentUser._id);
        // Actualizează starea globală
        useAuthStore.getState().updateUserProfile({
          ...currentUser,
          following: [...currentUser.following, targetUserId],
        });
      }

      // Actualizează starea locală
      setFollowingStatus((prev) => ({
        ...prev,
        [targetUserId]: !isFollowing,
      }));
    } catch (error) {
      console.error("Error toggling follow status:", error);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Navigare către profilul unui utilizator
  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose(); // Închidem modalul după navigare
  };

  if (!modalVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        listVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] transition-all duration-300 transform ${
          listVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:rotate-90"
          >
            <FaTimes />
          </button>
        </div>

        {/* User List */}
        <div
          ref={listContainerRef}
          className="overflow-y-auto p-2"
          style={{ maxHeight: "calc(80vh - 70px)" }}
        >
          {users.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-center">No users to display</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map((user, index) => {
                const isLastElement = index === users.length - 1;

                return (
                  <li
                    key={user._id}
                    ref={isLastElement ? lastUserElementRef : null}
                    onClick={() => navigateToProfile(user._id)}
                    className="py-3 px-4 hover:bg-gray-50 rounded-lg transition-all duration-200 transform hover:translate-x-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      {/* User info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-lg font-bold">
                                {user.username?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.username}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.firstname} {user.lastname}
                          </p>
                        </div>
                      </div>

                      {/* Follow/Unfollow button - nu afișăm pentru utilizatorul curent */}
                      {currentUser && currentUser._id !== user._id && (
                        <button
                          onClick={(e) => handleFollowToggle(user._id, e)}
                          disabled={followLoading[user._id]}
                          className={`ml-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            followingStatus[user._id]
                              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {followLoading[user._id] ? (
                            <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
                          ) : followingStatus[user._id] ? (
                            "Following"
                          ) : (
                            "Follow"
                          )}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          )}

          {/* End of list message - doar dacă există scroll */}
          {!hasMore && users.length > 0 && hasScroll && (
            <div className="text-center py-4 text-gray-500 text-sm">
              {users.length === 1
                ? "That's the only one!"
                : "You've reached the end of the list"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
