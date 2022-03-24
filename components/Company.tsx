import { Add, Remove } from "@mui/icons-material";
import { Button, Card, CardActions, CardHeader, IconButton, Typography } from "@mui/material";
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
    onAdd: (companyId: number) => {}
    onRemove: (companyId: number) => {}
};

// Component is a function that returns a JSX Element
// JSX Element can be inferred, but this makes it more obvious
const Company = ({ gameCode, company, userId, onAdd, onRemove }: CompanyWithCode): JSX.Element => {

    const gameConfig = CompanyConfig[gameCode];
    const config = gameConfig[company.companyCode];
    const shares = company.companyShares.find((value, index) => { return value.userId == userId });

    if (!shares)
        throw new Error(`Couldn't find any shares for user ${userId} and company ${company.id}`);

    const handleAdd = async () => {
        onAdd(company.id);
    };
    const handleRemove = async () => {
        onRemove(company.id)
    };
    return (
        <Card sx={{
            border: 4,
            borderColor: config.color,
            maxWidth: 200
        }}>
            <CardHeader
                title={config.name}
                titleTypographyProps={{ variant: 'h6' }}
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
                <Button size="small" color="primary">
                    Pay
                </Button>
            </CardActions>
        </Card>
    );
};

export default Company;