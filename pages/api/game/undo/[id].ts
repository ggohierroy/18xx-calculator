import { Company, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import ActionType from '../../../../components/undoTypes';
import prisma from '../../../../lib/prisma';

// PUT /api/game/undo/[id]
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const gameId = req.query.id;

    const game = await prisma!.game.findUnique({
        where: { id: Number(gameId) },
        include: { 
            currentStep: {
                include: {
                    actions: true
                }
            } 
        }
    })

    if(!game){
        return {
            notFound: true,
        };
    }

    if(!game.currentStep){
        res.end();
        return;
    }
        
    let io = (res as any).socket.server.io as Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

    for(let i = 0; i < game.currentStep.actions.length; i++){
        const undoAction = game.currentStep.actions[i];

        let typedActionType = ActionType[undoAction.actionType as keyof typeof ActionType];
        switch(typedActionType){
            case ActionType.createLog:
                await prisma!.log.delete({
                    where: { id: undoAction.entityId }
                })
                io.to(gameId.toString()).emit("log-deleted", undoAction.entityId);
                break;
            case ActionType.updateCompany:
                if(!undoAction.payload)
                    throw new Error("Payload can't be null");
                const undoCompany = eval(undoAction.payload);
                const company = await prisma!.company.findUnique({
                    where: { id: undoAction.entityId }
                })
                if(!company)
                    throw new Error("Company to undo no longer exists");
                const updatedCompanyPayload = undoCompany(company) as Company;
                const updatedCompany = await prisma!.company.update({
                    where: { id: company.id },
                    data: updatedCompanyPayload,
                    include: { 
                        companyShares: {
                            orderBy: {
                                id: "asc"
                            }
                        }
                    }
                })
                io.to(gameId.toString()).emit("company-updated", updatedCompany);
                break;
            case ActionType.updateUser:
                if(!undoAction.payload)
                    throw new Error("Payload can't be null");
                const undoUser = eval(undoAction.payload);
                const user = await prisma!.user.findUnique({
                    where: { id: undoAction.entityId }
                })
                if(!user)
                    throw new Error("User to undo no longer exists");
                const updatedUserPayload = undoUser(user) as User;
                const updatedUser = await prisma!.user.update({
                    where: { id: user.id },
                    data: updatedUserPayload
                })
                io.to(gameId.toString()).emit("user-updated", updatedUser);
                break;
        }
    }

    await prisma!.game.update({
        where: { id: Number(gameId) },
        data: { currentStepId: game.currentStep.previousStepId }
    })

    await prisma!.action.deleteMany({
        where: { stepId: game.currentStep. id }
    })

    await prisma!.step.delete({
        where: { id: game.currentStep.id }

    })

    res.end();
}