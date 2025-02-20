import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            minLength: 3,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minLength: 6  
        },
        firstname: {
            type: String,
            required: true,
            minLength: 2
        },
        lastname: {
            type: String,
            required: true,
            minLength: 2
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'guest'],
            default: 'user',    
            required: true
        },
        about: {
            type: String,
            max: 200
        },
        profilePicture: String,
        coverPicture: String,
        city: String,
        worksAt: String,
        followers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true // Adaugă automat createdAt și updatedAt
    }
)


const UserModel = mongoose.model('User', UserSchema);
export default UserModel;