import { Game, Prisma, User } from '@prisma/client'
import prisma from '../lib/prisma';
import { createAsyncThunk, createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from './store'
import usersSlice from './usersSlice';

// Define a type for the slice state
type GameState = {
    game: Pick<Game, 'gameCode' | 'id'>
}

// Define the initial state using that type
const initialState: GameState = {
    game: { gameCode: "none", id: -1 }
}

export const gameSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        setGame: (state, action: PayloadAction<Game>) => {
            state.game.id = action.payload.id;
            state.game.gameCode = action.payload.gameCode;
        }
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            state.game = action.payload.game.game;
        }
    },
})

export const { setGame } = gameSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectGame = (state: RootState) => state.game

export const selectGameId = (state: RootState) => state.game.game.id
export const selectGameCode = (state: RootState) => state.game.game.gameCode

export default gameSlice.reducer