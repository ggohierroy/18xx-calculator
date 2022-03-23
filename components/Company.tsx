import { Card, CardHeader } from "@mui/material";
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
    const config = CompanyConfig[gameCode][company.companyCode];
    const companyTitle = `${config.name} (${config.shortName})`
    return (
        <Card>
            <CardHeader
                sx={{
                    bgcolor: config.color
                }}
                title={companyTitle}
            />
        </Card>
    );
};

export default Company;