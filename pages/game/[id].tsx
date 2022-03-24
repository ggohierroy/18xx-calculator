import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import Container from "@mui/material/Container"
import prisma from '../../lib/prisma';
import Router from 'next/router';
import { Game, Prisma } from "@prisma/client";
import Box from "@mui/material/Box";
import Company from "../../components/Company";
import { Tab, Tabs, Typography } from "@mui/material";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const game = await prisma.game.findUnique({
        where: {
            id: Number(params?.id) || -1,
        },
        include: {
            companies: true,
            users: true
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

type GameWithCompaniesUsers = Prisma.GameGetPayload<{
    include: { companies: true, users: true }
}>

function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}

const GamePage: React.FC<GameWithCompaniesUsers> = (props) => {
    const [value, setValue] = React.useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    return (
        <Container>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Item One" {...a11yProps(0)} />
                    <Tab label="Item Two" {...a11yProps(1)} />
                    <Tab label="Item Three" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <Box
                sx={{
                    my: 4,
                    gap: 2,
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap'
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