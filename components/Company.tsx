import { Add, Remove } from "@mui/icons-material";
import { Button, Card, CardActions, CardHeader, IconButton, Typography } from "@mui/material";
import { Company } from "@prisma/client";
import CompanyConfig from "../company-configs/company-configs";

// Explicit typing of component properties
type CompanyWithCode = {
    gameCode: string;
    company: Company;
};

// Component is a function that returns a JSX Element
// JSX Element can be inferred, but this makes it more obvious
const Company = ({ gameCode, company }: CompanyWithCode): JSX.Element => {
    const gameConfig = CompanyConfig[gameCode];
    const config = gameConfig[company.companyCode];
    return (
        <Card sx={{
            border: 4,
            borderColor: config.color,
            maxWidth: 200
        }}>
            <CardHeader
                title={config.name}
                titleTypographyProps={{variant:'h6' }}
                subheader={config.shortName}
            />
            <CardActions disableSpacing>
                <IconButton aria-label="decrease share">
                    <Remove />
                </IconButton>
                <IconButton aria-label="increase share">
                    <Add />
                </IconButton>
                <Typography align="right" sx={{
                    padding: 1,
                    width: 1
                }}>
                    1
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