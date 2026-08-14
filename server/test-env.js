import "dotenv/config";

console.log("OPENAI:", process.env.OPENAI_API_KEY ? "FOUND" : "MISSING");
console.log("DATABASE:", process.env.DATABASE_URL ? "FOUND" : "MISSING");