// import { PrismaClient } from "@prisma/client";
import { query } from "express";

// it uses for db connection and  when query id is applied then it will loged in terminal
// const prisma = new PrismaClient({
//     log: ['query'],
// })

// export default prisma;

import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient({
            log: ['query'],
        });
    }
    prisma = global.prisma;
}

export default prisma;




