import "dotenv/config";
import { connectToDB } from "./config/db.js";
import app from "./app.js";

connectToDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
