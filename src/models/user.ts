import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: {
		type: String,
		required: function () {
			return !(this as any).googleId;
		},
		// default: null,
	},
	googleId: { type: String, unique: true, sparse: true },
});
export type TUser = {
	email: string;
	password?: string;
	googleId?: string;
	_id: string;
};
export const User = mongoose.models.User || mongoose.model("User", userSchema);
