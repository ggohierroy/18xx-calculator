import { Prisma, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import prisma from '../../../../lib/prisma';

type CompanyWithShares = Prisma.CompanyGetPayload<{
    include: {
        companyShares: true
    }
}>

// PUT /api/game/calculate-score/[id]
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const gameId = req.query.id;
    const { users, companies } = req.body as { users: User[], companies: CompanyWithShares[] };
    
    const companiesResult = await prisma!.company.findMany({
        where: { gameId: Number(gameId) },
        include: { companyShares: true }
    });

    const usersResult = await prisma!.user.findMany({
        where: { gameId: Number(gameId) }
    });

    let companiesShareValue : Record<number, { companyId: number, shareValue: number }> = { };
    const scorePerPlayer: String[] = [];
    for(let i = 0; i < usersResult.length; i++) {
        const user = usersResult[i];
        const inputUser = users.find(u => u.id == user.id);
        if(!inputUser)
            throw new Error("Couldn't find user");

        const cash = inputUser.cash || 0;

        await prisma!.user.update({
            where: { id: user.id },
            data: { cash: cash }
        })

        let shareTotal = 0;
        companiesResult.forEach(company =>{
            const inputCompany = companies.find(c => c.id == company.id);
            if(!inputCompany)
                throw new Error("Couldn't find company");
            
            const shareValue = inputCompany.shareValue || 0;
            const share = company.companyShares.find(cs => cs.userId == user.id);
            companiesShareValue[company.id] = { companyId: company.id, shareValue: shareValue };

            if(!share)
                throw new Error("Couldn't find share for user");
            
            shareTotal += shareValue * share.quantity;
        });

        const total = cash + shareTotal;

        scorePerPlayer.push(`${user.name} = ${total}`);
    };

    for(let index in companiesShareValue){
        let company = companiesShareValue[index];
        await prisma!.company.update({
            where: { id: company.companyId },
            data: { shareValue: company.shareValue }
        })
    }

    const scorePerPlayerText = scorePerPlayer.join(", ");
    const logText = `Final Score: ${scorePerPlayerText}`;

    const logResult = await prisma!.log.create({
        data: {
            gameId: Number(gameId),
            value: logText
        }
    })

    let io = (res as any).socket.server.io as Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    io.to(gameId).emit("log-created", logResult);

    res.status(200).end();
}