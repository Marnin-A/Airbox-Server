import express from "express";

const router = express.Router();

// Define user routes
router.get("/users", (req, res) => {
	res.send("List of users");
});

router.get("/users/:id", (req, res) => {
	res.send(`User with ID: ${req.params.id}`);
});

export default router;
