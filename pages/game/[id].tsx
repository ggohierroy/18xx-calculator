import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import Container from "@mui/material/Container"
import prisma from '../../lib/prisma';
import Router from 'next/router';
import { CompanyShare, Game, Prisma, User } from "@prisma/client";
import Box from "@mui/material/Box";
import Company from "../../components/Company";
import { AppBar, Button, IconButton, Menu, MenuItem, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Logs from "../../components/Logs";
import MenuIcon from '@mui/icons-material/Menu';
import { AccountCircle } from "@mui/icons-material";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const game = await prisma.game.findUnique({
        where: {
            id: Number(params?.id) || -1,
        },
        include: {
            companies: {
                orderBy: {
                    companyCode: "asc"
                },
                include: {
                    companyShares: true
                }
            },
            users: {
                orderBy: {
                    name: "asc"
                }
            }
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
    const [companies, setCompanies] = React.useState(props.companies);
    const [users, setUsers] = React.useState(props.users);
    const [socket, setSocket] = React.useState<Socket<DefaultEventsMap, DefaultEventsMap>>();
    
    React.useEffect(() => { 
        socketInitializer();
        const lastUserIdStorage = localStorage.getItem(`lastUserId${props.id}`);
        let lastUserId = 0;
        if(lastUserIdStorage)
            lastUserId = parseInt(lastUserIdStorage);
        if(lastUserId !== 0){
            let user = users.find(user => user.id == lastUserId);
            if(!user)
                throw new Error("Couldn't find user");
            setSelectedUser(user);
        }
    }, []);

    const socketInitializer = async () => {
        await fetch('/api/socket');
        
        let socket = io();

        socket.on('connect', () => {
            socket.emit("join-game", props.id);
        })

        socket.on('company-share-updated', (companyShare: CompanyShare) => {
            updateCompanyShare(companyShare);
        })

        socket.on('company-updated', (company: CompanyWithShares) => {
            updateCompany(company);
        })

        socket.on('users-updated', (users: User[]) => {
            updateUsers(users);
        })

        setSocket(socket);
    };

    const updateUsers = async (users: User[]) => {
        setUsers(users);
        setSelectedUser(selectedUser => {
            var currentUser = users.find(user => user.id == selectedUser.id);
            return currentUser || selectedUser;
        });
    };

    // Called when there is a payout so the last payout can be updated
    const updateCompany = async (newCompany: CompanyWithShares) => {
        setCompanies(companies => {
            const newCompanies = companies.map((company) => {
                if (company.id != newCompany.id)
                    return company;
    
                return newCompany;
            });
            return newCompanies;
        });
    };

    // Called when number of shares for a player is changed
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
    };

    const handlePayout = async (companyId: number, payout: number) => {
        const company = getCompany(companyId, companies);
        if(!company)
            throw new Error(`No company was found.`);

        const newCompany = {
            ...company,
            lastPayout: payout
        }
        updateCompany(newCompany);

        try {
            const body = { payout: payout, gameId: props.id };
            await fetch(`/api/company/payout/${newCompany.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getCompany = (companyId: number, companies: CompanyWithShares[]) => {
        let foundCompany: CompanyWithShares | undefined;
        companies.forEach(company => {
            if(company.id != companyId)
                return;

            foundCompany = company;
        });

        return foundCompany;
    };

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
    };

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

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleUserSelected = async (userId: Number) => {
        let user = users.find(user => user.id == userId); 
        if(!user)
            throw new Error("Couldn't find user");
        window.localStorage.setItem(`lastUserId${props.id}`, userId.toString());
        setSelectedUser(user);
    };

    const handleReset = async () => {
        try {
            const response = await fetch(`/api/user/resetSum?gameId=${props.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if(!response.ok){
                console.error(response.statusText);
                return;
            }

            const usersResult = await (response.json() as Promise<User[]>);

            setUsers(usersResult);
            setSelectedUser(selectedUser => {
                var currentUser = usersResult.find(user => user.id == selectedUser.id);
                return currentUser || selectedUser;
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Box>
            <AppBar position="sticky">
                <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Last dividend: {selectedUser.lastPayout} ({selectedUser.cumulativePayout})
                </Typography>
                <div>
                    <Button
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        {selectedUser.name}
                    </Button>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        {users.map((user) => (
                        <MenuItem 
                            key={user.id} 
                            onClick={() => { 
                                handleClose();
                                handleUserSelected(user.id);
                            }}
                        >
                            <Typography textAlign="center">{user.name}</Typography>
                        </MenuItem>
                        ))}
                    </Menu>
                </div>
                </Toolbar>
            </AppBar>
            <Container>
                <Logs gameId={props.id} socket={socket} />
                <Box
                    sx={{
                        mt: 1,
                        gap: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap'
                    }}
                >
                    <Button>Undo</Button>
                    <Button>Redo</Button>
                    <Button onClick={handleReset}>Reset Sum</Button>
                    <Button>Calculate Final Score</Button>
                </Box>
                <Box
                    sx={{
                        mt: 1,
                        gap: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap'
                    }}
                >
                    {companies.map((company) => (
                        <Company key={company.id} gameCode={props.gameCode} company={company} selectedUser={selectedUser} onAdd={handleAdd} onConfirmPayout={handlePayout} />
                    ))}
                </Box>
            </Container>
        </Box>
    )
}

export default GamePage