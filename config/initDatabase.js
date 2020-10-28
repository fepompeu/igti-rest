import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const initNewDatabase = async () => {
  try {
    const data = JSON.parse(await readFile("gradesbk.json"));

    await writeFile("grades.json", JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(error);
  }
};

export default initNewDatabase;
