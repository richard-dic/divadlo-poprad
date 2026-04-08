import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10)
  const controllerPassword = await bcrypt.hash("controller123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.sk" },
    update: {},
    create: {
      email: "admin@admin.sk",
      password: adminPassword,
      role: UserRole.ADMIN
    }
  })

  const controller = await prisma.user.upsert({
    where: { email: "controller@scan.sk" },
    update: {},
    create: {
      email: "controller@scan.sk",
      password: controllerPassword,
      role: UserRole.CONTROLLER
    }
  })

  console.log("✅ Users created:")
  console.log("ADMIN:", admin.email)
  console.log("CONTROLLER:", controller.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })