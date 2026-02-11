import { Router } from "express";
import { createUser, getUsers } from "./users.controller.js";

const router = Router();

router.post(
    '/create',
    createUser
)
router.get(
    '/',
    getUsers
)

export default router;