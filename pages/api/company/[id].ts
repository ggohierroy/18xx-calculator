import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import prisma from '../../../lib/prisma';

// PUT /api/company
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const companyId = req.query.id;
    const { quantity, gameId } = req.body as { quantity: number, gameId: number };

    const result = await prisma!.company.update({
        where: { id: Number(companyId) },
        data: {
            companyPayingShares: quantity,
        },
        include: {
            companyShares: true,
        }
    });

    let io = (res as any).socket.server.io as Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    io.to(gameId.toString()).emit("company-updated", result);

    res.json(result);
}