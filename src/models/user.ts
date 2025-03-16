import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	googleId: { type: String, unique: true, sparse: true },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
