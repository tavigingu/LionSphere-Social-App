import React from "react";
import { FaHeart, FaComment, FaShare } from "react-icons/fa"; // Iconițe pentru like, comment, share
import { IPost } from "../types/PostTypes"; // Interfața pentru un post

const PostCard: React.FC<IPost> = ({
  userId,
  username,
  desc,
  likes,
  image,
}) => {

  return (
    <div
      className="
            w-full           // lățime completă pe mobil
            max-w-md         // lățime maximă medie
            sm:max-w-lg      // lățime mai mare pe ecrane mici
            lg:max-w-xl      // și mai mare pe ecrane mari
            min-h-[500px]    // înălțime minimă
            sm:min-h-[600px] // puțin mai mare pe ecrane mici
            lg:min-h-[800px] // și mai mare pe ecrane mari
            lg:min-w-[750px]
            backdrop-blur-sm 
            bg-white/5 
            rounded-xl 
            shadow-lg 
            p-4            // padding mai mic pe mobil
            sm:p-6         // padding mai mare pe ecrane mici
            border 
            border-gray-800 
            transition-all 
            duration-300 
            hover:shadow-xl 
            flex 
            flex-col
        "
    >
      {/* Header cu username-ul și imaginea utilizatorului care postează */}
      <div className="flex items-center mb-4">
        <div
          className="
                w-8 
                h-8 
                sm:w-10 
                sm:h-10 
                bg-white 
                rounded-full 
                border 
                border-green-500 
                flex 
                items-center 
                justify-center 
                mr-4
            "
        >
          <span className="text-gray-400 text-xs">No Image</span>
        </div>
        <span
          className="
                text-white 
                font-medium 
                text-base 
                sm:text-lg
            "
        >
          {username}
        </span>
      </div>

      {/* Imaginea principală a postării */}
      <div className="flex-grow relative mb-4">
        <div
          className="
                absolute 
                inset-0 
                bg-gradient-to-r 
                from-red-500 
                via-purple-500 
                to-blue-500 
                rounded-lg 
                overflow-hidden
            "
        >
          {image ? (
            <img
              src={image}
              alt="Post Image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="
                    w-full 
                    h-full 
                    flex 
                    items-center 
                    justify-center 
                    text-gray-300 
                    text-sm
                "
            >
              No Post Image
            </div>
          )}
        </div>
      </div>

      {/* Interacțiuni (like, comment, share) */}
      <div
        className="
              flex 
              items-center 
              justify-between 
              mb-4
              text-sm 
              sm:text-base
          "
      >
        <button
          className="
                flex 
                items-center 
                text-gray-300 
                hover:text-red-500 
                transition-colors
            "
        >
          <FaHeart className="mr-2 size-4 sm:size-5" /> {likes.length} Likes
        </button>
        <button
          className="
                flex 
                items-center 
                text-gray-300 
                hover:text-blue-500 
                transition-colors
            "
        >
          <FaComment className="mr-2 size-4 sm:size-5" /> Comment
        </button>
        <button
          className="
                flex 
                items-center 
                text-gray-300 
                hover:text-green-500 
                transition-colors
            "
        >
          <FaShare className="mr-2 size-4 sm:size-5" /> Share
        </button>
      </div>

      {/* Descrierea */}
      <div>
        <p
          className="
                text-gray-300 
                text-sm 
                sm:text-base
                mb-8
            "
        >
          {desc}
        </p>
      </div>
    </div>
  );
};

export default PostCard;
