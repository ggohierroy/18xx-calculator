import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import prisma from '../../../../lib/prisma';
import CompanyConfig from '../../../../company-configs/company-configs';
import { User } from '@prisma/client';

// PUT /api/company/payout
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const companyId = req.query.id;
    const { payout, gameId } = req.body as { payout: number, gameId: number };

    const game = await prisma.game.findUnique({
        where: { id: gameId}
    })

    if(!game)
        throw new Error(`Couldn't find game`);

    // get the company, shares, and users
    const company = await prisma.company.findUnique({
        where: { id: Number(companyId) },
        include: {
            companyShares: {
                include: {
                    user: true
                }
            }
        }
    });

    if(!company)
        throw new Error(`Couldn't find company`);

    // Create log
    const companyConfig = CompanyConfig[game.gameCode][company.companyCode]
    const payoutPerPlayer: String[] = [];
    const usersResult: User[] = [];
    for(let i = 0; i < company.companyShares.length; i++){
        let share = company.companyShares[i];

        const playerPayout = share.quantity * Number(payout);
        const total = playerPayout + share.user.cumulativePayout;
        
        if(playerPayout > 0){
            payoutPerPlayer.push(`${playerPayout} to ${share.user.name} (${total})`);
        }

        // update user
        const userResult = await prisma.user.update({
            where: { id: share.userId },
            data: {
                lastPayout: playerPayout,
                cumulativePayout: total
            }
        });
        
        usersResult.push(userResult);
    }

    // update last payout
    const companyPayout = payout * company.companyPayingShares;
    const total = company.cumulativeReceived + companyPayout
    if(companyPayout > 0)
        payoutPerPlayer.push(`${companyPayout} to ${companyConfig.shortName} (${total})`);
    const companyResult = await prisma.company.update({
        where: { id: Number(companyId) },
        include: {
            companyShares: true
        },
        data: {
            lastPayout: payout,
            lastReceived: companyPayout,
            cumulativeReceived: total
        }
    })

    const playerPayoutText = payoutPerPlayer.join(", ");
    const logText = `${companyConfig.shortName} pays out ${payout} per share: ${playerPayoutText}`;

    const logResult = await prisma.log.create({
        data: {
            gameId: gameId,
            value: logText
        }
    })

    const sortedUsers = usersResult.sort((a, b) => a.name.localeCompare(b.name));

    let io = (res as any).socket.server.io as Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    io.to(gameId.toString()).emit("users-updated", sortedUsers);
    io.to(gameId.toString()).emit("company-updated", companyResult);
    io.to(gameId.toString()).emit("log-created", logResult);

    res.json(companyResult);
}