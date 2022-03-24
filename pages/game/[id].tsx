import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import Container from "@mui/material/Container"
import prisma from '../../lib/prisma';
import Router from 'next/router';
import { CompanyShare, Game, Prisma } from "@prisma/client";
import Box from "@mui/material/Box";
import Company from "../../components/Company";
import { Tab, Tabs, Typography } from "@mui/material";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const game = await prisma.game.findUnique({
        where: {
            id: Number(params?.id) || -1,
        },
        include: {
            companies: {
                include: {
                    companyShares: true
                }
            },
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
    include: { 
        companies: {
            include: {
                companyShares: true
            }
        },
        users: true 
    }
}>

function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}

const GamePage: React.FC<GameWithCompaniesUsers> = (props) => {
    const [selectedUser, setSelectedUser] = React.useState(props.users[0]);
    const [tabIndex, setTabIndex] = React.useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedUser(props.users[newValue]);
        setTabIndex(newValue);
    };
    const [companies, setCompanies] = React.useState(props.companies);

    const handleAdd = async (companyId: number) => {

        var modifiedShare: CompanyShare | undefined;
        const newCompanies = companies.map((company) => {
            if(company.id != companyId)
                return company;
            
            const newShares = company.companyShares.map((share) => {
                if(share.userId != selectedUser.id)
                    return share;
                
                const newShare = {
                    ...share,
                    quantity: share.quantity + 1
                }

                modifiedShare = {...newShare};
                
                return newShare;
            });
            const newCompany = {
                ...company,
                companyShares: newShares
            }

            return newCompany;
        });

        if(!modifiedShare)
            throw new Error(`No modifiable share was found.`);

        setCompanies(newCompanies);

        try {
            const body = { companyShareId: modifiedShare.id, quantity: modifiedShare.quantity };
            await fetch('/api/company-share', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemove = async (companyId: number) => {
        // if (shareNumber == 0)
        //     return;
        // setShareNumber(shareNumber - 1)
    };

    return (
        <Container>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleChange} aria-label="basic tabs example">
                    {props.users.map((user) => (
                    <Tab key={user.id} label={user.name} {...a11yProps(user.id)} />
                    ))}
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
                {companies.map((company) => (
                    <Company key={company.id} gameCode={props.gameCode} company={company} userId={selectedUser.id} onAdd={handleAdd} onRemove={handleRemove} />
                ))}
            </Box>
        </Container>
    )
}

export default GamePage