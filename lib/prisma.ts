// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Frameworks like Next.js support hot reloading of changed files, which enables you to see changes to your application without restarting.
// However, if the framework refreshes the module responsible for exporting PrismaClient, this can result in additional, unwanted instances of PrismaClient in a development environment.
// As a workaround, you can store PrismaClient as a global variable in development environments only, as global variables are not reloaded:

let prisma: PrismaClient | undefined;

if (typeof window === "undefined") {
  let isCreated = false;
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
    isCreated = true;
  } else {
    let globalWithPrisma = global as typeof globalThis & {
      prisma: PrismaClient;
    };
    if (!globalWithPrisma.prisma) {
      globalWithPrisma.prisma = new PrismaClient();
      isCreated = true;
    }
    prisma = globalWithPrisma.prisma;
  }
  if (isCreated) {
    // This shit right here is to fix a problem with NextJS that can't serialize JS dates
    // It's gotta be strings...
    prisma.$use(async (params, next) => {
      let result = await next(params);
      if (params.model == 'Game' && params.action == 'findUnique' && params.args.include?.logs) {
        result.logs.forEach((log: any) => {
          log.createdTime = log.createdTime.toISOString();
        })
      }
      return result;
    })
  }
}

export default prisma;