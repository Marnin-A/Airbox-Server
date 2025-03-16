import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import morgan from "morgan";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import { connectDB } from "@/utils/db";
import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/users";
import analyticsRoutes from "@/routes/analytics";
import { TUser, User } from "@/models/user";
import "dotenv/config";
import { isAuthenticated } from "@/middleware/middleware";

// Extend the session interface to include userId
declare module "express-session" {
	interface SessionData {
		userId: string;
	}
}

const app = express();
const port = 5000;
const serverURL =
	process.env.NODE_ENV === "development"
		? `http://localhost:${port}`
		: process.env.PROD_SERVER_URL;

// Connect to MongoDB
connectDB().then(() => {
	// Enable CORS
	app.use(
		cors({
			origin: "http://localhost:5173",
			credentials: true,
		})
	);
	// Add request logging
	app.use(morgan("tiny"));

	// Ensure DB is connected before using session store
	// Removed top-level await, DB will now be connected during server initialization.

	// Session configuration
	app.use(
		session({
			secret: process.env.SECRET_COOKIE_PASSWORD!,
			resave: false,
			saveUninitialized: false,
			store: MongoStore.create({
				client: mongoose.connection.getClient(), // Use the existing connection
				collectionName: "sessions", // Store session data in "sessions" collection
			}),
			cookie: {
				secure: process.env.NODE_ENV === "development" ? false : true, // Set to true in production with HTTPS
				httpOnly: true,
				maxAge: 24 * 60 * 60 * 1000, // 24 hours
			},
		})
	);

	// Passport configuration
	app.use(passport.initialize());
	app.use(passport.session());

	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID || "",
				clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
				callbackURL: `${serverURL}/auth/google/callback`,
				passReqToCallback: true,
			},
			async (req, accessToken, refreshToken, profile, done) => {
				try {
					// Check if the user already exists in your database
					let user = await User.findOne({ googleId: profile.id });

					if (!user) {
						// If the user doesn't exist, create a new user
						user = new User({
							googleId: profile.id,
							email: profile.emails?.[0].value,
							name: profile.displayName,
							password: undefined,
							// You might want to store more profile information
						});

						await user.save();
					}

					req.session.userId = user._id.toString();
					return done(null, user);
				} catch (error) {
					console.error("Google OAuth error:", error);
					return done(error);
				}
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, (user as TUser)._id);
	});

	passport.deserializeUser(async (id: string, done) => {
		try {
			const user = await User.findById(id);
			if (!user) {
				return done(null, false); // User not found
			}
			done(null, user);
		} catch (error: any) {
			console.error("Error deserializing user:", error);
			return done(error);
		}
	});

	// Express middleware to parse JSON
	app.use(express.json());

	// API routes
	app.use("/api", authRoutes);
	app.use("/api", userRoutes);
	app.use("/api", isAuthenticated); // Prevent access to protected routes
	app.use("/api", analyticsRoutes);

	// Google OAuth routes
	app.get(
		"/auth/google",
		passport.authenticate("google", {
			scope: ["profile", "email"],
			accessType: "offline",
			prompt: "consent",
		})
	);

	app.get(
		"/auth/google/callback",
		passport.authenticate("google", { failureRedirect: "/login" }),
		(req, res) => {
			// Successful authentication, redirect home.
			res.redirect("http://localhost:5173"); // Redirect to your React app
		}
	);

	// Start the server
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});

	console.log("Connected to MongoDB");
});
