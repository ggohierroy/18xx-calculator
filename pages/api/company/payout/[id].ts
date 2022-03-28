import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import prisma from '../../../../lib/prisma';

// PUT /api/company/payout
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const companyId = req.query.id;
    const { payout, gameId } = req.body;

    // get the company and shares
    const company = await prisma.company.findUnique({
        where: { id: Number(companyId) },
        include: {
            companyShares: true
        }
    });

    // update last payout
    const result = await prisma.company.update({
        where: { id: Number(companyId) },
        include: {
            companyShares: true
        },
        data: {
            lastPayout: payout
        }
    })

    let io = (res as any).socket.server.io as Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    
    io.to(gameId).emit("log-created", result);
    io.to(gameId).emit("company-updated", result);

    res.json(result);
}