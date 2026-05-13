import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const defaults: Array<{ area: string; labels: string[] }> = [
  { area: "Entry", labels: ["Door", "Locks", "Walls", "Floor"] },
  { area: "Living room", labels: ["Walls", "Floor", "Windows", "Outlets"] },
  { area: "Kitchen", labels: ["Sink", "Cabinets", "Stove", "Fridge", "Counters"] },
  { area: "Bathroom", labels: ["Toilet", "Sink", "Tub", "Tiles", "Fan"] },
  { area: "Bedroom", labels: ["Walls", "Floor", "Closet", "Windows"] },
  { area: "Windows", labels: ["Frames", "Screens", "Locks"] },
  { area: "Walls", labels: ["Paint", "Scuffs", "Nail holes"] },
  { area: "Floors", labels: ["Carpet", "Hardwood", "Baseboards"] },
  { area: "Appliances", labels: ["Dishwasher", "Microwave", "Washer", "Dryer"] },
];

async function main() {
  let sortOrder = 0;

  for (const room of defaults) {
    for (const label of room.labels) {
      await prisma.checklistTemplate.upsert({
        where: {
          area_label: {
            area: room.area,
            label,
          },
        },
        update: {
          sortOrder,
        },
        create: {
          area: room.area,
          label,
          sortOrder,
        },
      });
      sortOrder += 10;
    }
  }

  const demoEmail = "demo@rentready.local";
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { name: "Demo Renter" },
    create: {
      email: demoEmail,
      name: "Demo Renter",
      onboardingChoice: "Protect my deposit",
    },
  });

  await prisma.subscription.upsert({
    where: {
      id: "demo-subscription",
    },
    update: {
      userId: demoUser.id,
      status: "PRO_PREVIEW",
      plan: "PRO",
      provider: "LOCAL",
      interval: "year",
    },
    create: {
      id: "demo-subscription",
      userId: demoUser.id,
      status: "PRO_PREVIEW",
      plan: "PRO",
      provider: "LOCAL",
      interval: "year",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
