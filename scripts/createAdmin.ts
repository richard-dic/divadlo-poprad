import { prisma } from "../lib/prisma"
import bcrypt from "bcrypt"

async function main() {

  const password = await bcrypt.hash("admin123", 10)

  await prisma.user.create({
    data: {
      email: "admin@divadlo.sk",
      password,
      role: "ADMIN"
    }
  })

  console.log("Admin vytvorený")

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())