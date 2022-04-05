import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// GET /api/log
export default async function handle(req: NextApiRequest, res: NextApiResponse) {

    const { gameId } = req.query;

    const logs = await prisma!.log.findMany({
        where: { gameId: Number(gameId) },
        orderBy: {
            createdTime: "asc"
        }
    })

    res.json(logs);
}