const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const Category = require("../models/Category");

const defaultCategories = [
  {
    name: "Web Development",
    description: "Learn front-end and full-stack web development.",
  },
  {
    name: "App Development",
    description: "Build mobile applications for iOS and Android.",
  },
  {
    name: "Programming",
    description: "Master fundamental and advanced programming languages.",
  },
  {
    name: "Data Science",
    description: "Analyze data, build models, and discover insights.",
  },
  {
    name: "Artificial Intelligence",
    description: "Explore neural networks, modern AI architectures, and LLMs.",
  },
  {
    name: "Machine Learning",
    description: "Understand machine learning algorithms and predictive analytics.",
  },
  {
    name: "Cybersecurity",
    description: "Protect networks, systems, and programs from digital attacks.",
  },
  {
    name: "Cloud Computing",
    description: "Learn AWS, Azure, Google Cloud, and scalable cloud solutions.",
  },
  {
    name: "Game Development",
    description: "Design and build 2D and 3D games using popular game engines.",
  },
  {
    name: "DevOps",
    description: "Master CI/CD pipelines, containerization, and infrastructure as code.",
  },
  {
    name: "Database Management",
    description: "Learn SQL, NoSQL, data modeling, and performance tuning.",
  },
  {
    name: "UI/UX Design",
    description: "Design user-friendly interfaces and engaging user experiences.",
  },
];

async function seedCategories() {
  const mongoUrl =
    process.env.MONGODB_URL || process.env.MONGODB_URI;

  if (!mongoUrl) {
    console.error("Error: MONGODB_URL is not defined in server/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB for category seeding.");

    let addedCount = 0;
    let existingCount = 0;

    for (const cat of defaultCategories) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${cat.name}$`, "i") },
      });

      if (!existing) {
        await Category.create({
          name: cat.name,
          description: cat.description,
          courses: [],
        });
        console.log(`+ Added category: "${cat.name}"`);
        addedCount++;
      } else {
        existingCount++;
      }
    }

    console.log(
      `Seeding complete. Added: ${addedCount}, Already existed: ${existingCount}. Total categories in DB: ${
        addedCount + existingCount
      }`
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed categories:", error.message);
    process.exit(1);
  }
}

seedCategories();

