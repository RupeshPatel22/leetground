import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js";

export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body
        const userId = req.user.id;

        if(!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length) {
            return res.status(400).json({error: "Invalid orr missing test cases"})
        }

        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input,
        }))

        const submitResponse = await submitBatch(submissions)

        const tokens = submitResponse.map((res) => res.token)

        const results = await pollBatchResults(tokens)
        console.log('res', results);

        let allPassed = true;
        const detailedResults = results.map((result, i) => {
            const stdout = result.stdout?.trim();
            const expected_output = expected_outputs[i]?.trim();
            const passed = stdout === expected_output;

            if(!passed) allPassed = false;

            return {
                testCase: i+1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compile_output: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ?`${result.time} S` : undefined,
            }
            // console.log(`testcase ${i+1}`);
            // console.log(`input ${stdin[i]}`);
            // console.log(`expected output for testcase ${expected_output}`);
            // console.log(`actual output ${stdout}`);
            // console.log(`matched: ${passed}`);
            
        })
        console.log(detailedResults);

        //store submission summary
        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLanguageName(language_id),
                stdin: stdin.join('\n'),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.some((r) => r.stderr)? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,
                compileOutput: detailedResults.some((r) => r.compile_output)? JSON.stringify(detailedResults.map((r) => r.compile_output)) : null,
                status: allPassed ? "Accepted":"Wrong Answer",
                memory: detailedResults.some((r) => r.memory)? JSON.stringify(detailedResults.map((r) => r.memory)) : null,
                time: detailedResults.some((r) => r.time)? JSON.stringify(detailedResults.map((r) => r.time)) : null
            }
        });

        // if all passed = true mark problem as solved for the current user
        if(allPassed) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId:{
                        userId, problemId
                    }
                },
                update:{},
                create:{
                    userId, problemId
                }
            })
        }

        //save individual test case results using detailedResult
        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compileOutput,
            status: result.status,
            memory: result.memory,
            time: result.time
        }))

        await db.testCaseResult.createMany({
            data: testCaseResults
        })
        
        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submission.id
            },
            include: {
                testcases: true
            }
        })
        
        res.status(200).json({
            success: true,
            message: "Code executed successfully!!",
            submission: submissionWithTestCase
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error while executing the code"})
    }
}
