import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import CompanyConfig from '../../../company-configs/company-configs';


// POST /api/game
export default async function handle(req: NextApiRequest, res: NextApiResponse) {

    const gameName = "1822";

    // create a new game
    const game = await prisma.game.create({ data: {} });

    // insert companies
    const gameConfig = CompanyConfig[gameName];

    let data = [];
    for(var companyCode in gameConfig) {
        data.push({ companyCode: companyCode, gameId: game.id });
    }
    const companies = await prisma.company.createMany({
        data: data
      })

    res.json(game);
}