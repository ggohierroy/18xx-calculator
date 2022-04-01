import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";
import CompanyConfig from "../company-configs/company-configs";

const ParTable = ({ gameCode }: { gameCode: string }): JSX.Element | null => {
    const parTable = CompanyConfig[gameCode].parTable;
    const [open, setOpen] = React.useState(false);
    const handleOpenModal = () => setOpen(true);
    const handleCloseModal = () => setOpen(false);
    if(!parTable)
        return null;
    return (
        <Box>
            <Button onClick={handleOpenModal}>Par Table</Button>
            <Dialog open={open} onClose={handleCloseModal} maxWidth={'xs'} fullWidth={true} >
                <DialogTitle>Par Table</DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <TableCell align="center">Par Value</TableCell>
                                <TableCell align="center">Total</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {parTable.map((parValue) => (
                                <TableRow
                                    key={parValue}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                <TableCell align="center" component="th" scope="row">
                                    {parValue}
                                </TableCell>
                                <TableCell align="center">{parValue*6}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default ParTable;