import express, { Request, Response, NextFunction } from "express";

export const isAuthenticated = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.session.userId) {
		res.status(401).json({ message: "Unauthorized. Please log in." });
	}
	next();
};
