import express from "express";
import winston from "winston";
import gradesRoutes from "./routes/grades.js";
import initNewDatabase from "./config/initDatabase.js";

global.fileName = "grades.json";

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "igti-rest-app.log" }),
  ],
  format: combine(label({ label: "igti-rest-app" }), timestamp(), myFormat),
});

const app = express();
app.use(express.json());
app.use("/grades", gradesRoutes);

initNewDatabase();

app.listen(3000, () => {
  console.log("API Started!");
});
