import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic:{
      type: String,
      default: "https://imgs.search.brave.com/1WFIpUNAOtVXo51SuasJnMAgOsPwQQXErqrO6H1Ps1M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzk4LzFk/LzZiLzk4MWQ2YjJl/MGNjYjVlOTY4YTA2/MThjOGQ0NzY3MWRh/LmpwZw"
    },
    expoPushToken: {
      type: String,
      default: null
    },
    notificationPreferences: {
      issueUpdates: { type: Boolean, default: true },
      statusChanges: { type: Boolean, default: true },
      adminMessages: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;