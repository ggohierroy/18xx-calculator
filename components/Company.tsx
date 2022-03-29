import { Add, Remove } from "@mui/icons-material";
import { Box, Button, ButtonGroup, Card, CardActions, CardHeader, IconButton, Modal, TextField, Typography } from "@mui/material";
import { Company, CompanyShare } from "@prisma/client";
import React from "react";
import CompanyConfig from "../company-configs/company-configs";

// Explicit typing of component properties
type CompanyWithCode = {
    gameCode: string;
    company: (Company & {
        companyShares: CompanyShare[];
    });
    userId: number;
    onAdd: (companyId: number, quantity: number) => {}
    onConfirmPayout: (companyId: number, payout: number) => {}
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

// Component is a function that returns a JSX Element
// JSX Element can be inferred, but this makes it more obvious
const Company = ({ gameCode, company, userId, onAdd, onConfirmPayout }: CompanyWithCode): JSX.Element => {

    const gameConfig = CompanyConfig[gameCode];
    const config = gameConfig[company.companyCode];
    const shares = company.companyShares.find((value, index) => { return value.userId == userId });

    if (!shares)
        throw new Error(`Couldn't find any shares for user ${userId} and company ${company.id}`);

    const handleAdd = async () => {
        onAdd(company.id, 1);
    };
    const handleRemove = async () => {
        onAdd(company.id, -1);
    };
    const handleMinus5 = async () => { setPayoutAmount(payoutAmount - 5); };
    const handleMinus1 = async () => { setPayoutAmount(payoutAmount - 1); };
    const handlePlus5 = async () => { setPayoutAmount(payoutAmount + 5); };
    const handlePlus1 = async () => { setPayoutAmount(payoutAmount + 1); };

    const handleConfirm = async () => { 
        onConfirmPayout(company.id, payoutAmount);
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
            maxWidth: 200
        }}>
            <CardHeader
                title={config.name}
                titleTypographyProps={{ variant: 'body1' }}
                subheader={config.shortName}
            />
            <CardActions disableSpacing>
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
                    {shares.quantity}
                </Typography>
            </CardActions>
            <CardActions disableSpacing>
                <Button onClick={handleOpen} size="small" color="primary" variant="contained">
                    Pay
                </Button>
                <Typography sx={{ml:1}} variant="caption">Last: {company.lastPayout} per share</Typography>
                <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                >
                <Box sx={modalStyle}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                    {config.name} Payout
                    </Typography>
                    <TextField 
                        id="standard-basic" 
                        label="Per Share Amount" 
                        variant="standard" 
                        value={payoutAmount} 
                        onChange={handleChange}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }} 
                    />
                    <Typography id="modal-modal-description" sx={{ mt: 1 }}>
                    Last payout: {company.lastPayout} per share
                    </Typography>
                    <ButtonGroup sx={{mt: 1}}variant="outlined" aria-label="outlined button group">
                        <Button onClick={handleMinus5}>-5</Button>
                        <Button onClick={handleMinus1}>-1</Button>
                        <Button onClick={handlePlus1}>+1</Button>
                        <Button onClick={handlePlus5}>+5</Button>
                    </ButtonGroup>
                    <Button onClick={handleConfirm} variant="contained" fullWidth={true} sx={{mt: 1}}>Confirm</Button>
                </Box>
                </Modal>
            </CardActions>
        </Card>
    );
};

export default Company;