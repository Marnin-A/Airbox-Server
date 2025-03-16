import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	business_name: { type: String, required: true },
	contact_email: { type: String, required: true },
	phone: { type: String, required: true },
});

export const Profile =
	mongoose.models.Profile || mongoose.model("Profile", profileSchema);
