import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'; // it is used to generate and verify JSON Web Tokens (JWTs) for user authentication
import bcrypt from 'bcrypt'; // it is used to hash and compare passwords for secure storage and authentication

const userSchema  = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
    
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
)


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10); // this.password = await bcrypt.hash(this.password, 10); // this line hashes the password before saving it to the database
});

// this method is used to compare the provided password with the hashed password stored in the database
// returns true if the passwords match, false otherwise
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password); // this line compares the provided password with the hashed password stored in the database
}

// this method is used to generate an access token for the user

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        }
    , process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    }
)
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {   
            _id: this._id,
            
        }
    , process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
    })
}   

export const User = mongoose.model("User", userSchema);
