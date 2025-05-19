import { response } from "express";
import {db} from "../libs/db.js"

import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";



export const createProblem = async (req,res) => {
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippet,
      referenceSolutions,
    } = req.body;

    if(req.user.role !== "ADMIN") {
        return res.status(403).json({error: "You are not allowed to create a problem"})
    }

    try {
        for(const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language);
            if(!languageId) {
                return res.status(400).json({error: `Language ${language} is not supported`})
            }

            const submissions = testcases.map(({input, output}) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin:input,
                expected_output: output

            }))

            const submissionResults = await submitBatch(submissions)

            const tokens = submissionResults.map((res) => res.token)
            const results = await pollBatchResults(tokens)
            
            for(let i=0; i < results.length; i++){
                
                const result = results[i]
                console.log("result...", result);

                if(result.status.id !== 3) {
                    return res.status(400).json({error: `Testcase ${i+1} failed to language ${language}`})
                }
            }

            const newProblem = await db.problem.create({
              data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippet,
                referenceSolutions,
                userId: req.user.id
              },
            });

            return res.status(201).json({
                success:true,
                message: "Problem created successfully",
                problem: newProblem
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error while creating problem"
        })
        
    }
}

export const getAllProblems = async (req,res) => {
    try {
        const problems = await db.problem.findMany();

        if(!problems) {
            return res.status(404).json({
                error: "No problems found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            data: problems
        })
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            error: "Error while fetching the problems"
        })
    }
}

export const getProblemById = async (req,res) => {
    const {id} = req.params;

    try {
        const problem = await db.problem.findUnique({
            where: {
                id 
            }
        })
        if(!problem) {
            return res.status(404).json({
                error: "Problem not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Problem fetched successfully",
            data: problem
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error while fetching problem by Id"
        })
    }
}

export const updateProblem = async (req,res) => {

}
export const deleteProblem = async (req,res) => {
    const {id} = req.params

    try {
        const problem = await db.problem.findUnique({
            where: {id}
        })
        if(!problem) {
            return res.status(404).json({
                error: "Problem not found"
            })
        }

        await db.problem.delete({where: {id}})

        res.status(200).json({
            success: true,
            message: "Problem deleted successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error while deleting the problem!"
        })
        
    }
}
export const getAllProblemsSolvedByUser = async (req,res) => {
    try {
        const problems = await db.problem.findMany({
            where: {
                solvedBy: {
                    some: {
                        userId: req.user.id
                    }
                }
            },
            include: {
                solvedBy:{
                    where: {
                        userId: req.user.id
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            problems
        })
    } catch (error) {
        console.error("Error fetching problem: ", error);
        res.status(500).json({error: "Failed to fetch problems"})
        
    }
}