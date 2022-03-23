import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import Container from "@mui/material/Container"
import prisma from '../../lib/prisma';
import Router from 'next/router';
import { Game, Prisma } from "@prisma/client";
import Box from "@mui/material/Box";
import Company from "../../components/Company";

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
                flexDirection: 'row'
                }}
            >
                {props.companies.map((company) => (
                    <Company key={company.id} gameCode={props.gameCode} company={company} />
                ))}
            </Box>
        </Container>
    )
}

export default GamePage