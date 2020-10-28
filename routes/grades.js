import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    let grade = req.body;
    console.log(grade.name);

    if (!grade.student || !grade.subject || !grade.type || !grade.value) {
      throw new Error("Student, subject, type and value must be filled.");
    }

    const data = JSON.parse(await readFile(global.fileName));

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);
    logger.info(`POST /grades - ${JSON.stringify(grade)}`);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const grade = req.body;
    const id = req.params.id;

    if (!id || !grade.value) {
      throw new Error("Id and value must be filled");
    }

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.grades.findIndex((a) => a.id === parseInt(id));

    if (index === -1) {
      throw new Error("Record not found");
    }

    data.grades[index].id = parseInt(id);
    data.grades[index].value = grade.value;
    data.grades[index].timestamp = new Date();

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);
    logger.info(`PUT /grades - ${JSON.stringify(grade)}`);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
    logger.info(`DELETE /grades/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const grade = data.grades.find(
      (grade) => grade.id === parseInt(req.params.id)
    );
    res.send(grade);
    logger.info(`GET /grades/${req.params.id} - ${JSON.stringify(grade)}`);
  } catch (err) {
    next(err);
  }
});

router.get("/sum/:student/:subject", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const studentGrades = data.grades.filter(
      (grade) =>
        !grade.student.localeCompare(req.params.student) &&
        !grade.subject.localeCompare(req.params.subject)
    );
    const sumValues = studentGrades.reduce((acumulator, current) => {
      return acumulator + current.value;
    }, 0);

    const studanteGradesSum = {
      studant: req.params.student,
      totalValue: sumValues,
    };

    res.send(studanteGradesSum);
    logger.info(
      `GET /grades/sum/${req.params.student}/${
        req.params.subject
      } - ${JSON.stringify(studanteGradesSum)}`
    );
  } catch (err) {
    next(err);
  }
});

router.get("/average/:subject/:type", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const subjectGrades = data.grades.filter(
      (grade) =>
        !grade.subject.localeCompare(req.params.subject) &&
        !grade.type.localeCompare(req.params.type)
    );
    const sumValues = subjectGrades.reduce((acumulator, current) => {
      return acumulator + current.value;
    }, 0);
    console.log(sumValues);
    const averageValues = sumValues / subjectGrades.length;

    const studanteGradesSum = {
      studant: req.params.subject,
      averageValue: averageValues,
    };

    res.send(studanteGradesSum);
    logger.info(
      `GET /grades/sum/${req.params.subject}/${
        req.params.type
      } - ${JSON.stringify(studanteGradesSum)}`
    );
  } catch (err) {
    next(err);
  }
});

router.get("/best/:subject/:type", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const subjectGrades = data.grades.filter(
      (grade) =>
        !grade.subject.localeCompare(req.params.subject) &&
        !grade.type.localeCompare(req.params.type)
    );

    const sortedGrades = subjectGrades
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
    res.send(sortedGrades);
    logger.info(
      `GET /grades/best/${req.params.subject}/${
        req.params.type
      } - ${JSON.stringify(sortedGrades)}`
    );
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;
