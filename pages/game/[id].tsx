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
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

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

type CompanyWithShares = Prisma.CompanyGetPayload<{
    include: {
        companyShares: true
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
        window.localStorage.setItem(`lastIndex${props.id}`, newValue.toString());
    };
    const [companies, setCompanies] = React.useState(props.companies);

    let socket: Socket<DefaultEventsMap, DefaultEventsMap>
    React.useEffect(() => { 
        socketInitializer();
        const lastIndexStorage = localStorage.getItem(`lastIndex${props.id}`);
        let lastIndex = 0;
        if(lastIndexStorage)
            lastIndex = parseInt(lastIndexStorage);
        if(lastIndex !== 0){
            setSelectedUser(props.users[lastIndex]);
            setTabIndex(lastIndex);
        }
    }, []);
    const socketInitializer = async () => {
        await fetch('/api/socket');
        socket = io();

        socket.on('connect', () => {
            socket.emit("join-game", props.id);
        })

        socket.on('company-share-updated', (companyShare: CompanyShare) => {
            updateCompanyShare(companyShare);
        })
    }

    const companiesPrint = (companies: any) => {
        console.log("-------------------- print companies --------------------")
        companies.forEach((company: any) => {
            let shareUser = [`share company ${company.companyCode}`];
            company.companyShares.forEach((share: any) =>{
                shareUser.push(`[userId:${share.userId} - quantity:${share.quantity}]`);
            });
            console.log(shareUser.join(", "));
        });
    }

    const updateCompany = async (newCompany: CompanyWithShares) => {
        setCompanies(companies => {
            const newCompanies = companies.map((company) => {
                if (company.id != newCompany.id)
                    return company;
    
                return newCompany;
            });
            return newCompanies;
        });
    }

    const updateCompanyShare = async (newCompanyShare: CompanyShare) => {
        setCompanies(companies => {
            const newCompanies = companies.map((company) => {
                if (company.id != newCompanyShare.companyId)
                    return company;
    
                const newShares = company.companyShares.map((share) => {
                    if (share.userId != newCompanyShare.userId)
                        return share;
    
                    return newCompanyShare;
                });
                const newCompany = {
                    ...company,
                    companyShares: newShares
                }
    
                return newCompany;
            });
            return newCompanies;
        });
    }

    const handlePayout = async (companyId: number, payout: number) => {
        const company = getCompany(companyId, companies);
        if(!company)
            throw new Error(`No company was found.`);

        const newCompany = {
            ...company,
            lastPayout: payout
        }
        updateCompany(newCompany);
    }

    const getCompany = (companyId: number, companies: CompanyWithShares[]) => {
        let foundCompany: CompanyWithShares | undefined;
        companies.forEach(company => {
            if(company.id != companyId)
                return;

            foundCompany = company;
        });

        return foundCompany;
    }

    const getCompanyShare = (companyId: number, userId: number, companies: CompanyWithShares[]) => {
        let companyShare: CompanyShare | undefined;
        companies.forEach(company => {
            if(company.id != companyId)
                return;
            company.companyShares.forEach(share => {
                if(share.userId != userId)
                    return;
                
                companyShare = share;
            });
        });

        return companyShare;
    }

    const handleAdd = async (companyId: number, quantity: number) => {

        const share = getCompanyShare(companyId, selectedUser.id, companies);
        if(!share)
            throw new Error(`No share was found.`);
        
        const newShare = {
            ...share,
            quantity: share.quantity + quantity
        }

        updateCompanyShare(newShare);

        try {
            const body = { quantity: newShare.quantity, gameId: props.id };
            await fetch(`/api/company-share/${newShare.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error(error);
        }
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
                    <Company key={company.id} gameCode={props.gameCode} company={company} userId={selectedUser.id} onAdd={handleAdd} onConfirmPayout={handlePayout} />
                ))}
            </Box>
        </Container>
    )
}

export default GamePage