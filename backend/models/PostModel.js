import mongoose from "mongoose";

const PostSchema = mongoose.Schema(
    {
    userId : {
        type: String,
        required: true
    },
    desc: {
        type: String,
        max: 500
    },
    likes: [String],
    image: String,
    createdAt: {
            type: Date,
            default: Date.now 
            },
    comments: [{   
        userId: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
          max: 500, // Limita maximă pentru textul comentariului
        },
        likes: [String], // Opțional: like-uri pentru comentariu
        replies: [
          {
            userId: {
              type: String,
              required: true,
            },
            text: {
              type: String,
              required: true,
              max: 500,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
            likes: [String], // Opțional: like-uri pentru răspuns
          },
        ],
        createdAt: {
            type: Date,
            default: Date.now 
            }
    }]
    },

    {
        timestamps: true // Adaugă automat createdAt și updatedAt
    }

)

const PostModel = mongoose.model('Post', PostSchema);
export default PostModel;