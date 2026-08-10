import {Router} from "express"; // Router is a class in express
import { registerUser, loginUser, logoutUser, updateAccessToken, changeCurrentPassword,getUserProfile, updateUserProfile, updateUserAvatar} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";


const router = Router();

// router.post("/register", registerUser);
router.route("/register").post(
    // upload.single("avatar"),
    upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1}]),
    registerUser);

router.route("/login").post(loginUser);



// secure routes
router.route("/logout").post(verifyJwtToken, logoutUser);

router.route("/update-access-token").post(updateAccessToken);

router.route("/change-password").post(verifyJwtToken, changeCurrentPassword);

router.route("/get-user-profile").get(verifyJwtToken, getUserProfile);

router.route("/update-user-profile").patch(verifyJwtToken, updateUserProfile);

router.route("/avatar").patch(verifyJwtToken, upload.single("avatar"), updateUserAvatar)

export default router;