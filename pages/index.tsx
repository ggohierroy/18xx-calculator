import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import Router from 'next/router';
import { Game } from '@prisma/client';
import React from 'react';

const Home: NextPage = () => {

  const createNewGame = async () => {
    try {
      const body = { gameCode: gameCode };
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error(response.statusText);
        return;
      }

      const game = await (response.json() as Promise<Game>);

      await Router.push('/game/[id]', `/game/${game.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const [gameCode, setGameCode] = React.useState("1882");
  const handleChange = (event: SelectChangeEvent) => {
    setGameCode(event.target.value as string);
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
        <FormControl>
          <InputLabel id="demo-simple-select-label">Game</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={gameCode}
            label="Game"
            onChange={handleChange}
          >
            <MenuItem value={"1882"}>1882</MenuItem>
            <MenuItem value={"18Chesapeake"}>18Chesapeake</MenuItem>
            <MenuItem value={"1849"}>1849</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => { createNewGame(); }}>
          Create New Game
        </Button>
        <a href="https://www.patreon.com/bePatron?u=71825145" data-patreon-widget-type="become-patron-button">Become a Patron!</a><script async src="https://c6.patreon.com/becomePatronButton.bundle.js"></script>
      </Box>
    </Container>
  );
};

export default Home;