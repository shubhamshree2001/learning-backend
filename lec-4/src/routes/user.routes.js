import {Router} from "express"; // Router is a class in express
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

// router.post("/register", registerUser);
router.route("/register").post(
    // upload.single("avatar"),
    upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1}]),
    registerUser);
// router.route("/login").post(loginUser);

export default router;