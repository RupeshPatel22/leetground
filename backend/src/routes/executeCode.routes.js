import express, { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { executeCode } from "../controller/exexuteCode.controller.js";

const executionRoutes = express.Router();

executionRoutes.post("/", authMiddleware, executeCode)
export default executionRoutes