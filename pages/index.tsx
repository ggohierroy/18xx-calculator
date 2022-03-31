import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, FormControl, InputLabel, Link, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import Router from 'next/router';
import { Game } from '@prisma/client';
import React from 'react';

const Home: NextPage = () => {

  const createNewGame = async () => {
    try {
      const body = { gameCode: gameCode, playerNames: playerNames };
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

  const [numberPlayers, setNumberPlayers] = React.useState(4);
  const [playerNames, setPlayerNames] = React.useState<{ number: number, name: string }[]>([
    {number: 1, name: ""},
    {number: 2, name: ""},
    {number: 3, name: ""},
    {number: 4, name: ""}
  ]);

  const handleChangePlayers = (event: SelectChangeEvent) => {
    
    const numberOfPlayers = Number(event.target.value);

    setNumberPlayers(numberOfPlayers);
    
    setPlayerNames(playerNames => {
      const newPlayerNames: { number: number, name: string }[] = [];
      for(let i = 0; i < numberOfPlayers; i++){
        if(typeof playerNames[i] === "undefined")
          newPlayerNames.push({ number: i + 1, name: "" });
        else
          newPlayerNames.push(playerNames[i]);
      }
      return newPlayerNames;
    })
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, playerNumber: number) => {
    setPlayerNames(playerNames => {
      return playerNames.map(playerName => {
        if(playerName.number != playerNumber)
          return playerName
        return {
          ...playerName,
          name: event.target.value
        }
      })
    })
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
        <FormControl sx={{ minWidth: 200 }}>
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
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="number-players-label">Number of Players</InputLabel>
          <Select
            labelId="number-players-label"
            id="select-number-players"
            value={numberPlayers.toString()}
            label="Number of Players"
            onChange={handleChangePlayers}
          >
            <MenuItem value={"1"}>1</MenuItem>
            <MenuItem value={"2"}>2</MenuItem>
            <MenuItem value={"3"}>3</MenuItem>
            <MenuItem value={"4"}>4</MenuItem>
            <MenuItem value={"5"}>5</MenuItem>
            <MenuItem value={"6"}>6</MenuItem>
          </Select>
        </FormControl>
        {playerNames.map((player) => (
        <TextField 
            key={player.number}
            label={`Player ${player.number}`}
            variant="standard" 
            value={player.name} 
            onChange={(e) => { handleNameChange(e, player.number) }}
        />
        ))}
        <Button sx={{ minWidth: 200 }} variant="contained" onClick={() => { createNewGame(); }}>
          Create New Game
        </Button>
        <Link sx={{mt: 5}} href="https://www.patreon.com/bePatron?u=71825145">Become a Patron!</Link>
      </Box>
    </Container>
  );
};

export default Home;