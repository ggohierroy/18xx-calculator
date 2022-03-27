import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import prisma from '../../../lib/prisma';

// PUT /api/company-share
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const companyShareId = req.query.id;
    const { quantity, gameId } = req.body;

    const result = await prisma.companyShare.update({
        where: { id: Number(companyShareId) },
        data: {
            quantity: quantity,
        },
    });

    let io = (res as any).socket.server.io as Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    io.to(gameId).emit("company-share-updated", result);

    res.json(result);
}