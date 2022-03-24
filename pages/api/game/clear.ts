import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';


// POST /api/game
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    await prisma.company.deleteMany({});
    await prisma.game.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.companyShare.deleteMany({});
}