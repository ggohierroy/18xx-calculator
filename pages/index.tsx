import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Router from 'next/router';
import { Game } from '@prisma/client';

const Home: NextPage = () => {

  const createNewGame = async () => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if(!response.ok){
        console.error(response.statusText);
        return;
      }

      const game = await (response.json() as Promise<Game>);

      await Router.push('/game/[id]', `/game/${game.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const clearAllGames = async() => {
    try {
      await fetch('/api/game/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          gap: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          18xx Calculator
        </Typography>
        <Button variant="contained" onClick={ () => { createNewGame(); } }>
          Create New Game
        </Button>
        <Button variant="contained" onClick={ () => { clearAllGames(); } }>
          Clear All Games
        </Button>
      </Box>
    </Container>
  );
};

export default Home;