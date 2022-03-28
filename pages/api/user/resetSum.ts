import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import prisma from '../../../lib/prisma';
import CompanyConfig from '../../../company-configs/company-configs';
import { User } from '@prisma/client';

// PUT /api/user/resetSum?gameId=
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const { gameId } = req.query;
    await prisma.user.updateMany({
        where: { gameId: Number(gameId) },
        data: { cumulativePayout: 0 }
    })
    const result = await prisma.user.findMany({
        where: { gameId: Number(gameId) },
        orderBy: {
            name: "asc"
        }
    })

    let io = (res as any).socket.server.io as Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    io.to(gameId).emit("users-updated", result);

    res.json(result);
}