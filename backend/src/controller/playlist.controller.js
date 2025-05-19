import { db } from "../libs/db.js";

export const getAllListDetails = async (req, res) => {
  try {
    const playLists = await db.playlist.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playLists,
    });
  } catch (error) {
    console.error("Error fetching playlist: ", error);
    res.status(500).json({
      error: "Feailed to fetch the playlist",
    });
  }
};
export const getPlayListDetails = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playList = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playList) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully!!",
      playList,
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Failed to fetch the playlist!!" });
  }
};
export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    const userId = req.user.id;

    const playList = await db.playList.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist created successfully!!",
      playList,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
};
export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;
  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemsId" });
    }
    const addPlaylist = await db.problemInPlaylist.createMany({
      data: problemIds.map((problemId) => {
        playlistId, problemId;
      }),
    });

    res.status(201).json({
      success: true,
      message: "Problem added successfully!!",
      addPlaylist,
    });
  } catch (error) {
    console.error("Error adding problem: ", error);
    res.status(500).json({ error: "Failed to add problem!!" });
  }
};
export const deletePlaylists = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const deletePlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist deleted Successfully!!",
      deletePlaylist,
    });
  } catch (error) {
    console.error("Error deleting playlist!!");
    res.status(500).json({ error: "failed to delete the playlist!!" });
  }
};
export const removeProblemFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemId" });
    }
    const deleteProblem = await db.problemInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully!!",
      deleteProblem,
    });
  } catch (error) {
    console.error("Error deleting problem!!");
    res.status(500).json({ error: "Failed to delete the problem!!" });
  }
};
