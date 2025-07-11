import "./utils/dotenv.config";
import connectDB from "./lib/db/connection";
import app from "./app";

connectDB().then(() => {
    if(!process.env.PORT){
        console.log("ATTENTION - PORT not found.");
    }
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running at port ${process.env.PORT}.`);
    });
    app.on("error", (error) => {
        console.log("Server error: ", error);
    });
}).catch((error:Error) => {
    console.log("MongoDB connection error: ", error);
    throw error;
});
