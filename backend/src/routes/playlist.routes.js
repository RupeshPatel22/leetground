import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { addProblemToPlaylist, createPlaylist, deletePlaylists, getAllListDetails, getPlayListDetails, removeProblemFromPlaylist } from "../controller/playlist.controller.js"

const playlistRoutes = express.Router()

playlistRoutes.get("/", authMiddleware, getAllListDetails)
playlistRoutes.get("/:playlistId", authMiddleware, getPlayListDetails)
playlistRoutes.post("/create-plalist", authMiddleware, createPlaylist)
playlistRoutes.post("/:playlistId/add-problem", authMiddleware, addProblemToPlaylist)
playlistRoutes.delete("/:playlistId", authMiddleware, deletePlaylists)
playlistRoutes.delete("/:playlistId/remove-problem", authMiddleware, removeProblemFromPlaylist)

export default playlistRoutes