import { db } from "../libs/db.js";

export const getAllSubmission = async (req,res) => {
    try {
        const userId = req.user.id;

        const submissions = await db.submission.findMany({
            where: {
                userId: userId
            }
        })

        res.status(200).json({
            success: true,
            message: "Submissions fetched successfully!!",
            submissions
        })
    } catch ({error}) {
        console.error("Getch submissions error:", error)
        res.status(500).json({error: "Failed to fetch submissions"})
    }
}
export const getSubmissionsForProblem = async (req,res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;
        
        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId
            }
        })

        res.status(200).json({
            success: true,
            message: "Submission fetched successfully!!",
            submissions
        })
    } catch (error) {
        console.error("Fetch submissions error: ", error);
        res.status(500).json({
            error: "Failed to fetch the submissions"
        })
        
    }
}
export const getAllTheSubmissionsForProblem = async (req,res) => {
    try {
        const problemId = req.params.problemId;

        const submission = await db.submission.count({
            where: {
                problemId: problemId
            }
        })

        if(!submission) {
            res.status(404).json({
                error: "Submissions not Found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Submissons fetched successfully!!",
            count: submission
        })
    } catch (error) {
        console.error("Fetch all the submission for problem error: ", error);
        res.status(500).json({error: "Failed to fetch submissions!"})
        
    }
}