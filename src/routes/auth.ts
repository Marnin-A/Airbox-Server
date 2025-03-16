import express, { Request, Response } from "express";
import { registerUser, loginUser, getCurrentUser } from "./../utils/db";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
	try {
		const result = await registerUser(req.body);
		if (result.success) {
			res
				.status(200)
				.json({ success: true, message: result.message, data: result.user });
		} else {
			res.status(400).json({ success: false, message: result.message });
		}
	} catch (error: any) {
		console.error("Registration error:", error);
		res.status(500).json({ success: false, message: error.message });
	}
});

router.post("/login", async (req: Request, res: Response) => {
	try {
		const result = await loginUser(req.body, req);
		if (result.success) {
			res.status(200).json({ success: true, message: result.message });
		} else {
			res.status(401).json({ success: false, message: result.message });
		}
	} catch (error: any) {
		console.error("Login error:", error);
		res.status(500).json({ success: false, message: error.message });
	}
});

router.get("/user", async (req: Request, res: Response) => {
	try {
		const user = await getCurrentUser(req);
		if (user) {
			res.status(200).json({ user });
		} else {
			res.status(404).json({ message: "User not found" });
		}
	} catch (error: any) {
		console.error("Error getting current user:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

export default router;
