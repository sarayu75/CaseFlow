import "dotenv/config";
import { createApp } from "./src/app.js";

const app = createApp();
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});