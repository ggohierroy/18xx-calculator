import { Add, Remove } from "@mui/icons-material";
import { Button, ButtonGroup, Card, CardActions, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, TextField, Typography } from "@mui/material";
import { User } from "@prisma/client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import CompanyConfig from "../company-configs/company-configs";
import { companyUpdated, selectCompanyById } from "../redux/companiesSlice";
import { companyShareUpdated, selectCompanyShareById } from "../redux/companySharesSlice";
import { RootState } from "../redux/store";

// Explicit typing of component properties
type CompanyWithCode = {
    gameCode: string;
    gameId: number;
    companyId: number | string;
    selectedUser: User;
};

// Component is a function that returns a JSX Element
// JSX Element can be inferred, but this makes it more obvious
const CompanyJustId = ({ gameCode, gameId, companyId, selectedUser }: CompanyWithCode): JSX.Element => {

    const gameConfig = CompanyConfig[gameCode];
    const company = useSelector((state: RootState) => selectCompanyById(state, companyId))
    
    if(!company)
        throw new Error("Could no find company");

    const config = gameConfig.companies[company.companyCode];
    const shareId = company.sharesByUserId[selectedUser.id].shareId;
    const shares = useSelector((state: RootState) => selectCompanyShareById(state, shareId));
    const subHeader = `${config.shortName} - Last received: ${company.lastReceived} (${company.cumulativeReceived})`

    if (!shares)
        throw new Error(`Couldn't find any shares for user ${selectedUser.id} and company ${company.id}`);

    const dispatch = useDispatch();

    const handlePayout = async (payout: number) => {

        dispatch(companyUpdated({ id: companyId, changes: { lastPayout: payout }}));

        try {
            const body = { payout: payout, gameId: gameId };
            await fetch(`/api/company/payout/${companyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error(error);
        }
    };
    
    const onAdd = async (quantity: number) => {

        const newQuantity = shares.quantity + quantity;
        dispatch(companyShareUpdated({ id: shareId, changes: { quantity: newQuantity } }));

        try {
            const body = { quantity: newQuantity, gameId: gameId };
            await fetch(`/api/company-share/${shareId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error(error);
        }
    };

    const onAddCompany = async (quantity: number) => {

        const newQuantity = company.companyPayingShares + quantity;

        dispatch(companyUpdated({ id: companyId, changes: { companyPayingShares: newQuantity } }));

        try {
            const body = { quantity: newQuantity, gameId: gameId };
            await fetch(`/api/company/${companyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error(error);
        }
    }

    const handleAdd = async () => {
        onAdd(1);
    };
    const handleRemove = async () => {
        onAdd(-1);
    };
    const handleAddCompany = async () => {
        onAddCompany(1);
    };
    const handleRemoveCompany = async () => {
        onAddCompany(-1);
    };

    const handleMinus5 = async () => { setPayoutAmount(payoutAmount - 5); };
    const handleMinus1 = async () => { setPayoutAmount(payoutAmount - 1); };
    const handlePlus5 = async () => { setPayoutAmount(payoutAmount + 5); };
    const handlePlus1 = async () => { setPayoutAmount(payoutAmount + 1); };

    const handleConfirm = async () => { 
        handlePayout(payoutAmount);
        setOpen(false);
     };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPayoutAmount(parseInt(event.target.value));
    };

    const [open, setOpen] = React.useState(false);
    const [payoutAmount, setPayoutAmount] = React.useState(company.lastPayout);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Card sx={{
            border: 4,
            borderColor: config.color,
            width: 240
        }}>
            <CardHeader
                title={config.name}
                titleTypographyProps={{ variant: 'body2', noWrap: true, component: "div", width: 200 }}
                subheaderTypographyProps={{ variant: 'subtitle2'}}
                subheader={subHeader}
                sx={{pb:0}}
            />
            <CardActions sx={{py:0}} disableSpacing={true}>
                <IconButton aria-label="decrease company paying share" onClick={handleRemoveCompany}>
                    <Remove />
                </IconButton>
                <IconButton aria-label="increase company paying share" onClick={handleAddCompany}>
                    <Add />
                </IconButton>
                <Typography align="right" sx={{
                    padding: 1,
                    width: 1
                }}>
                    {config.shortName}: {company.companyPayingShares}
                </Typography>
            </CardActions>
            <CardActions sx={{py:0}} disableSpacing={true}>
                <IconButton aria-label="decrease share" onClick={handleRemove}>
                    <Remove />
                </IconButton>
                <IconButton aria-label="increase share" onClick={handleAdd}>
                    <Add />
                </IconButton>
                <Typography align="right" sx={{
                    padding: 1,
                    width: 1
                }}>
                    You: {shares.quantity}
                </Typography>
            </CardActions>
            <CardActions disableSpacing={true}>
                <Button onClick={handleOpen} size="small" color="primary" variant="contained">
                    Pay
                </Button>
                <Typography sx={{ml:1}} variant="caption">Last: {company.lastPayout} per share</Typography>
                <Dialog open={open} onClose={handleClose} maxWidth={'xs'} fullWidth={true} >
                    <DialogTitle>{config.name} Payout</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Last payout: {company.lastPayout} per share
                        </DialogContentText>
                        <TextField 
                            id="per-share-amount" 
                            label="Per Share Amount" 
                            variant="standard" 
                            value={payoutAmount} 
                            onChange={handleChange}
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }} 
                            margin="dense"
                            autoFocus
                            fullWidth
                        />
                        <ButtonGroup sx={{mt: 1}}variant="outlined" aria-label="outlined button group">
                            <Button onClick={handleMinus5}>-5</Button>
                            <Button onClick={handleMinus1}>-1</Button>
                            <Button onClick={handlePlus1}>+1</Button>
                            <Button onClick={handlePlus5}>+5</Button>
                        </ButtonGroup>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleConfirm} variant="contained">Confirm</Button>
                    </DialogActions>
                </Dialog>
            </CardActions>
        </Card>
    );
};

export default CompanyJustId;