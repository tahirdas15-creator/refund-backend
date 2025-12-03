import express from "express";
import cors from "cors";
import refundRoutes from "./routes/refundRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/refunds", refundRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
