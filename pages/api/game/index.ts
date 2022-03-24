import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import CompanyConfig from '../../../company-configs/company-configs';

// POST /api/companyShare
export default async function handle(req: NextApiRequest, res: NextApiResponse) {

    const gameCode = "1822";
    const numberOfPlayers = 4;

    // create a new game
    const game = await prisma.game.create({
        data: {
            gameCode: gameCode
        } 
    });

    // insert companies
    const gameConfig = CompanyConfig[gameCode];

    let companiesData = [];
    for(var companyCode in gameConfig) {
        companiesData.push({ companyCode: companyCode, gameId: game.id });
    }
    const resultCompanies = await prisma.company.createMany({
        data: companiesData
    })

    // insert users/players
    let usersData = [];
    for(var i = 1; i <= numberOfPlayers; i++){
        usersData.push({ gameId: game.id, name: "player" + i });
    }

    const resultUsers = await prisma.user.createMany({
        data: usersData
    })

    // get newly created users
    const users = await prisma.user.findMany({
        where: {
            gameId: game.id
        }
    })

    // get newly created companies
    const companies = await prisma.company.findMany({
        where: {
            gameId: game.id
        }
    })

    // insert company shares
    let companySharesData = [];
    for(let i = 0; i < users.length; i++){
        let user  = users[i];
        for(let j = 0; j < companies.length; j++){
            let company = companies[j];
            companySharesData.push({ userId: user.id, companyId: company.id });
        }
    }

    const resultCompanyShares = await prisma.companyShare.createMany({
        data: companySharesData
    })

    res.json(game);
}