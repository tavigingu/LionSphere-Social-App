// src/pages/Home.js
import React from "react";
import { useLocation } from "react-router-dom";
import Background from "../components/Background";
import ProfileSide from "../components/ProfileSide"; // Importă componenta
import PostCard from "../components/PostCard";
import { IPost } from "../types/PostTypes";

const hardcodedPosts: IPost[] = [
  {
    userId: "123456789abcdef",
    username: "taviii",
    desc: "Ce frumos e cerul de noapte astă-seară! 🌟",
    likes: ["987654321fedcba", "111111111111111"],
    image: "", // Exemplu de URL pentru imagine
  },
  {
    userId: "987654321fedcba",
    username: "maryam",
    desc: "Party time! 🎉 Să ne distrăm sub stele!",
    likes: ["123456789abcdef", "222222222222222"],
    image: "", // Exemplu de URL pentru imagine
  },
];

const Home: React.FC = () => {
  const location = useLocation();
  const user = location.state?.user; // Accesează datele utilizatorului

  if (!user) {
    return (
      <div className="relative min-h-screen text-white">
        ``
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
      <div className="relative z-10 flex flex-col lg:flex-row max-w-screen-xl mx-auto">
        {/* ProfileSide pentru mobile și desktop */}
        <div
          className="
          w-full 
          md:block
          md:relative
          md:max-w-[600px]
          sm:max-w-[300px]
          sm:items-center
          md:ml-0
          lg:w-[500px] 
          lg:ml-[25px]
          lg:fixed 
          lg:left-0 
          lg:top-4 
          lg:h-auto
          p-4
        "
        >
          <ProfileSide />
        </div>

        {/* Conținutul principal (postările) centrat */}
        <div
          className="
          w-full 
          lg:ml-[300px] 
          md:ml-0
          flex 
          justify-center 
          items-start 
          lg:items-center 
          min-h-screen 
          p-4
        "
        >
          <div
            className="
            grid 
            grid-cols-1 
            gap-6 
            w-full 
            max-w-[900px] 
            md:max-w-[800px] 
            sm:max-w-[600px]
            sm: items-center
            lg:max-w-[1000px] 
            pt-4
          "
          >
            {hardcodedPosts.map((post, index) => (
              <PostCard
                key={index}
                userId={post.userId}
                username={post.username}
                desc={post.desc}
                likes={post.likes}
                image={post.image}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
