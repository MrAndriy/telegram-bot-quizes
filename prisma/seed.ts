import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const readJsonFile = (filePath: string) => {
    const fullPath = path.join(__dirname, filePath);
    const data = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(data);
  };

  const dataDir = path.join(__dirname, "data");
  const files = fs.readdirSync(dataDir);

  const promises = files.map((file) => {
    const sectionName = path.basename(file, ".json").toUpperCase();
    const questions = readJsonFile(path.join("data", file));

    return prisma.section.create({
      data: {
        name: sectionName,
        questions: {
          create: questions.map((question: any) => ({
            question: question.question,
            options: {
              create: question.options,
            },
          })),
        },
      },
    });
  });

  await Promise.all(promises);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
