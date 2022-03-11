import type { NextPage } from 'next'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const Test: NextPage = () => {
    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                my: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                }}
            >
                <Button variant="contained">Payout</Button>

                <Card>
                    <CardContent>
                        <Typography variant="h5" component="div">
                        Canadian National
                        </Typography>
                    </CardContent>
                    <CardActions>
                    <IconButton aria-label="add">
                        <AddIcon />
                    </IconButton>
                    <IconButton aria-label="remove">
                        <RemoveIcon />
                    </IconButton>
                    </CardActions>
                </Card>

            </Box>
        </Container>
    )
}

export default Test