import { AppBar, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, TextField, Toolbar, Typography } from '@mui/material';
import { CompanyShare, Log, Prisma, User } from '@prisma/client';
import type { NextPage } from 'next';
import React from 'react';
import { selectGameCode, selectGameId, setGame } from '../../redux/gameSlice';
import { RootState, wrapper } from '../../redux/store';
import { io } from "socket.io-client";
import Router from 'next/router';
import CompanyConfig from '../../company-configs/company-configs';
import Logs from '../../components/Logs';
import ParTable from '../../components/ParTable';
import prisma from '../../lib/prisma';
import { selectAllUsers, selectUserById, usersReceived, usersSumReset, usersUpdated, userUpdated } from '../../redux/usersSlice';
import { selectedUserIdSet, selectSelectedUserId } from '../../redux/selectedUserSlice';
import { useDispatch, useSelector } from 'react-redux';
import { companiesSumReset, companyUpdated, denormalizedCompaniesReceived, selectAllCompanies, selectCompanyIds } from '../../redux/companiesSlice';
import { companyShareUpdated } from '../../redux/companySharesSlice';
import Company from '../../components/Company';
import { logAdded, logRemoved, logsReceived } from '../../redux/logsSlice';

export const getServerSideProps = wrapper.getServerSideProps(store => async ({params}) => {
    
    const id = Number(params?.id) || -1;

    const game = await prisma!.game.findUnique({
        where: {
            id: id,
        },
        include: {
            companies: {
                orderBy: {
                    companyCode: "asc"
                },
                include: {
                    companyShares: {
                        orderBy: {
                            id: "asc"
                        }
                    }
                }
            },
            users: true,
            logs: true
        }
    });

    if(!game)
        return { notFound: true };

    await store.dispatch(setGame(game));
    await store.dispatch(usersReceived(game.users));
    await store.dispatch(logsReceived(game.logs));
    await store.dispatch(selectedUserIdSet(game.users[0].id));
    await store.dispatch(denormalizedCompaniesReceived(game.companies));

    return {
        props: {
            id,
        },
    };
});

type CompanyWithShares = Prisma.CompanyGetPayload<{
    include: {
        companyShares: true
    }
}>

const GamePage : NextPage = (props) => {

    const gameId = useSelector(selectGameId);
    const selectedUserId = useSelector(selectSelectedUserId);
    const selectedUser = useSelector((state: RootState) => selectUserById(state, selectedUserId));
    const gameCode = useSelector(selectGameCode);
    const users = useSelector(selectAllUsers);
    const companyIds = useSelector(selectCompanyIds);
    const companies = useSelector(selectAllCompanies);

    if(!selectedUser)
        throw new Error("User does not exist");

    const dispatch = useDispatch();
    
    React.useEffect(() => { 
        socketInitializer();
        const lastUserIdStorage = localStorage.getItem(`lastUserId${gameId}`);
        let lastUserId = 0;
        if(lastUserIdStorage)
            lastUserId = parseInt(lastUserIdStorage);
        if(lastUserId !== 0){
            dispatch(selectedUserIdSet(lastUserId));
        }
    }, []);

    const socketInitializer = async () => {
        await fetch('/api/socket');
        
        let socket = io();

        socket.on('connect', () => {
            socket.emit("join-game", gameId);
        })

        socket.io.on('reconnect', () => {
            Router.replace(Router.asPath);
        })

        socket.on('company-share-updated', (companyShare: CompanyShare) => {
            dispatch(companyShareUpdated({ id: companyShare.id, changes: companyShare }));
        })

        socket.on('company-updated', (company: CompanyWithShares) => {
            dispatch(companyUpdated({ id: company.id, changes: company }));
        })

        socket.on('users-updated', (users: User[]) => {
            const payload = users.map(user => { return { id: user.id, changes: user } });
            dispatch(usersUpdated(payload))
        })

        socket.on('user-updated', (user: User) => {
            dispatch(userUpdated({ id: user.id, changes: user }));
        })

        socket.on('sum-reset', () => {
            dispatch(usersSumReset());
            dispatch(companiesSumReset());
        })

        socket.on('log-created', (log: Log) => {
            dispatch(logAdded(log));
        })
        socket.on('log-deleted', (logId: number) => {
            dispatch(logRemoved(logId));
        })
    };

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleUserSelected = async (userId: number) => {
        window.localStorage.setItem(`lastUserId${gameId}`, userId.toString());
        dispatch(selectedUserIdSet(userId));
    };

    const handleReset = async () => {

        dispatch(usersSumReset());
        dispatch(companiesSumReset());

        try {
            // reset users
            const response = await fetch(`/api/game/resetSum/${gameId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if(!response.ok){
                console.error(response.statusText);
                return;
            }

            const { usersResult, companiesResult } = await (response.json() as Promise<{usersResult: User[], companiesResult: CompanyWithShares[]}>);

        } catch (error) {
            console.error(error);
        }
    };

    const handleUndo = async () => {
        try {
            // undo last action
            const response = await fetch(`/api/game/undo/${gameId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if(!response.ok){
                console.error(response.statusText);
                return;
            }
        } catch (error) {
            console.error(error);
        }
    };

    const [open, setOpen] = React.useState(false);
    const handleOpenModal = () => setOpen(true);
    const handleCloseModal = () => setOpen(false);

    const handleShareValueChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, companyId: number) => {
        const shareValue = parseInt(event.target.value);
        dispatch(companyUpdated({ id: companyId, changes: { shareValue: shareValue }}));
    };

    const handleCashChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, userId: number) => {
        const cash = parseInt(event.target.value);
        dispatch(userUpdated({ id: userId, changes: { cash: cash } }));
    };

    const handleCalculateScore = async () => {
        setOpen(false);
        try {
            await fetch(`/api/game/calculate-score/${gameId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: users, companies: companies })
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
                <Logs />
                <Box
                    sx={{
                        mt: 1,
                        gap: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap'
                    }}
                >
                    <Button onClick={handleUndo}>Undo Payout</Button>
                    <Button onClick={handleReset}>Reset Sum</Button>
                    <Button onClick={handleOpenModal}>Calculate Final Score</Button>
                    <ParTable gameCode={gameCode} />
                    <Dialog open={open} onClose={handleCloseModal} maxWidth={'xs'} fullWidth={true} >
                        <DialogTitle>Calculate Final Score</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Company Share Values
                            </DialogContentText>
                            {companies.map((company) => (
                            <TextField 
                                key={company.id}
                                id="outlined-basic" 
                                label={`${CompanyConfig[gameCode].companies[company.companyCode].shortName} Share Value`}
                                variant="outlined" 
                                value={company.shareValue} 
                                onChange={(e) => { handleShareValueChange(e, company.id) }}
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                }} 
                                margin="dense"
                                fullWidth
                            />
                            ))}
                            <DialogContentText>
                                Player Cash on Hand
                            </DialogContentText>
                            {users.map((user) => (
                            <TextField 
                                key={user.id}
                                id="outlined-basic" 
                                label={`${user.name} Cash`}
                                variant="outlined" 
                                value={user.cash}
                                onChange={(e) => { handleCashChange(e, user.id) }}
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                }} 
                                margin="dense"
                                fullWidth
                            />
                            ))}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCalculateScore} variant="contained">Confirm</Button>
                        </DialogActions>
                    </Dialog>
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
                    {companyIds.map((companyId) => (
                        <Company key={companyId} gameCode={gameCode} gameId={gameId} companyId={companyId} selectedUser={selectedUser} />
                    ))}
                </Box>
            </Container>
        </Box>
    )
}

export default GamePage