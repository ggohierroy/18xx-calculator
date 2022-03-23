import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import Container from "@mui/material/Container"
import prisma from '../../lib/prisma';
import Router from 'next/router';
import { Game, Prisma } from "@prisma/client";
import Box from "@mui/material/Box";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const game = await prisma.game.findUnique({
        where: {
            id: Number(params?.id) || -1,
        },
        include: {
            companies: true
        }
    });

    if (!game) {
        return {
            notFound: true,
        };
    }

    return {
        props: game,
    };
};

type GameWithCompanies = Prisma.GameGetPayload<{
    include: { companies: true }
}>

const GamePage: React.FC<GameWithCompanies> = (props) => {
    
    return (
        <Container>
            <div>
                <h2>Welcome to Game {props.id}</h2>
            </div>
            <Box
                sx={{
                my: 4,
                gap: 2,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                }}
            >
                {props.companies.map((company) => (
                    <div key={company.id}>
                        Company {company.id}
                        {company.companyCode}
                    </div>
                ))}
            </Box>
        </Container>
    )
}

export default GamePage