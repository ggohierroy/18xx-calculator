import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import CompanyConfig from '../../../company-configs/company-configs';


// POST /api/game
export default async function handle(req: NextApiRequest, res: NextApiResponse) {

    const gameCode = "1822";

    // create a new game
    const game = await prisma.game.create({
        data: {
            gameCode: gameCode
        } 
    });

    // insert companies
    const gameConfig = CompanyConfig[gameCode];

    let data = [];
    for(var companyCode in gameConfig) {
        data.push({ companyCode: companyCode, gameId: game.id });
    }
    const companies = await prisma.company.createMany({
        data: data
    })

    res.json(game);
}