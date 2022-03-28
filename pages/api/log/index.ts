import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import prisma from '../../../lib/prisma';
import CompanyConfig from '../../../company-configs/company-configs';
import { User } from '@prisma/client';

// GET /api/log
export default async function handle(req: NextApiRequest, res: NextApiResponse) {

    const { gameId } = req.query;

    const logs = await prisma.log.findMany({
        where: { gameId: Number(gameId) },
        orderBy: {
            createdTime: "asc"
        }
    })

    res.json(logs);
}