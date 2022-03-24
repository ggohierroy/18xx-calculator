import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// PUT /api/company-share
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const { companyShareId, quantity } = req.body;

    const result = await prisma.companyShare.update({
        where: { id: companyShareId },
        data: {
            quantity: quantity,
        },
    });
    res.json(result);
}