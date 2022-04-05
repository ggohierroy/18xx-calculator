import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import prisma from '../../../../lib/prisma';
import CompanyConfig from '../../../../company-configs/company-configs';
import { Action, Step, User } from '@prisma/client';

// PUT /api/company/payout
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const companyId = req.query.id;
    const { payout, gameId } = req.body as { payout: number, gameId: number };

    const game = await prisma!.game.findUnique({
        where: { id: gameId},
        include: {
            currentStep: true
        }
    })

    if(!game)
        throw new Error(`Couldn't find game`);

    // create step if not exist
    let step: Step;
    const currentStep = game.currentStep;
    if(!currentStep){
        step = await prisma!.step.create({
            data: { }
        })
    } else {
        step = await prisma!.step.create({
            data: { previousStepId: currentStep.id }
        })
    }

    // update current step
    await prisma!.game.update({
        where: { id: game.id },
        data: { currentStepId: step.id }
    })

    // get the company, shares, and users
    const company = await prisma!.company.findUnique({
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

    const undoCommands: Omit<Action, 'id'>[] = [];

    // Create log
    const companyConfig = CompanyConfig[game.gameCode].companies[company.companyCode]
    const payoutPerPlayer: String[] = [];
    const usersResult: User[] = [];
    for(let i = 0; i < company.companyShares.length; i++){
        let share = company.companyShares[i];

        const playerPayout = share.quantity * Number(payout);
        const total = playerPayout + share.user.cumulativePayout;
        
        if(playerPayout > 0){
            payoutPerPlayer.push(`${playerPayout} to ${share.user.name} (${total})`);
        }

        // undo command
        const undoUser = `(user) => {
            user.lastPayout -= ${playerPayout - share.user.lastPayout};
            user.cumulativePayout -= ${total - share.user.cumulativePayout};
            return user;
        }`;
        undoCommands.push({ entityType: "user", entityId: share.user.id, actionType: "updateUser", payload: undoUser, stepId: step.id });

        // update user
        const userResult = await prisma!.user.update({
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

    // undo command
    const undoCompany = `(company) => {
        company.lastPayout -= ${payout - company.lastPayout};
        company.lastReceived -= ${companyPayout - company.lastReceived};
        company.cumulativeReceived -= ${total - company.cumulativeReceived};
        return company;
    }`;
    undoCommands.push({ entityType: "company", entityId: company.id, actionType: "updateCompany", payload: undoCompany, stepId: step.id });

    // update company
    const companyResult = await prisma!.company.update({
        where: { id: Number(companyId) },
        include: {
            companyShares: {
                orderBy: {
                    id: "asc"
                }
            }
        },
        data: {
            lastPayout: payout,
            lastReceived: companyPayout,
            cumulativeReceived: total
        }
    })

    const playerPayoutText = payoutPerPlayer.join(", ");
    const logText = `${companyConfig.shortName} pays out ${payout} per share: ${playerPayoutText}`;

    const logResult = await prisma!.log.create({
        data: {
            gameId: gameId,
            value: logText
        }
    })

    // undo command
    undoCommands.push({ entityType: "log", entityId: logResult.id, actionType: "createLog", stepId: step.id, payload: null });

    // persist undo commands
    await prisma!.action.createMany({
        data: undoCommands
    })

    const sortedUsers = usersResult.sort((a, b) => a.name.localeCompare(b.name));

    let io = (res as any).socket.server.io as Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    io.to(gameId.toString()).emit("users-updated", sortedUsers);
    io.to(gameId.toString()).emit("company-updated", companyResult);
    io.to(gameId.toString()).emit("log-created", logResult);

    res.json(companyResult);
}