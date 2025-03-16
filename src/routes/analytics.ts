import express, { NextFunction } from "express";

const router = express.Router();

router.get("/analytics", (req, res, next: NextFunction) => {
	if (req.session.userId) res.send("List of users");
	next();
});

export default router;
