import {Router} from "express"; // Router is a class in express
import { registerUser } from "../controllers/user.controller.js";


const router = Router();

// router.post("/register", registerUser);
router.route("/register").post(registerUser);
// router.route("/login").post(loginUser);

export default router;