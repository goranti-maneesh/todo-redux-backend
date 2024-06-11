import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";

const app = express();

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Origin",
			"X-Requested-With",
			"Accept",
		],
	})
);

app.use(express.json());

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.listen(3001, () => {
	console.log("Server is started at port 3001");
});

app.get("/api/generate", async (req, res) => {
	const { todo } = req.query;
	const prompt = `
	Generate a structured JSON object as a guide for achieving the todo: ${todo}. If the provided todo is valid, the response should contain the JSON object with the following structure:
{
    "todo": "The name of the todo.",
    "content": [
        {
            "name": "Introduction",
            "data": ["A brief overview of the todo, explaining its importance and relevance."]
        },
        {
            "name": "Prerequisites",
            "data": ["Necessary skills, knowledge, tools, or conditions required before starting this task."]
        },
        {
            "name": "Step-by-Step Guide",
            "data": ["Detailed steps required to complete the todo, each described clearly."]
        },
        {
            "name": "Tips and Tricks",
            "data": ["Practical advice, shortcuts, or insights that can help in efficiently accomplishing the todo."]
        },
        {
            "name": "Common Challenges and Solutions",
            "data": ["Typical challenges one might encounter, with each problem and its effective solution described on separate lines within the same bullet point."]
        }
    ]
}

If the provided todo is not valid or is private, the response should clearly explain why in 3 to 4 lines, and should follow this JSON structure:
{
    "todo": "The name of the todo",
    "content": [
        {
            "name": "Provide a correct todo",
            "data": ["A brief overview of why it is an incorrect or private todo, explaining its reason clearly."]
        }
    ]
}

The response should only contain the JSON object, without any introductory text. Please ensure that the content is engaging, informative, unique, and easy to understand for someone unfamiliar with the process. If an error occurs, provide a clear and understandable error message.
`;

	const anthropic = new Anthropic({
		apiKey: process.env.API_KEY,
	});

	const msg = await anthropic.messages.create({
		model: "claude-3-opus-20240229",
		max_tokens: 3000,
		temperature: 1,
		system: "You are an AI assistant with expertise in task management and productivity enhancement. Your task is to assist users in achieving specific todos by providing detailed and structured guides. For each todo, you must generate an organized content response, formatted as an object with two primary keys: 'todo' and 'content'. The 'todo' key should contain the name of the task, and the 'content' key should include an array of objects for each section of the guide. Each section object should have two keys: 'name' for the section heading and 'data' for an array of bullet points detailing actionable steps, tips, and solutions relevant to that section. The sections should cover Introduction, Prerequisites, Step-by-Step Guide, Tips and Tricks, and Common Challenges and Solutions. Ensure that your content is unique, easy to understand, and tailored to provide practical help for users unfamiliar with the task, maintaining a helpful and engaging tone throughout the conversation.",
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: prompt,
					},
				],
			},
		],
	});

	res.send(msg);
});
