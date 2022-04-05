import { User } from '@prisma/client'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from './store'

// Define a type for the slice state
type SelectedUserState = {
    selectedUserId: number
}

// Define the initial state using that type
const initialState: SelectedUserState = {
    selectedUserId: -1
}

const selectedUserSlice = createSlice({
    name: 'selectedUser',
    initialState,
    reducers: {
        selectedUserIdSet: (state, action: PayloadAction<number>) => {
            state.selectedUserId = action.payload;
        },
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            state.selectedUserId = action.payload.selectedUser.selectedUserId;
        }
    }
})

export const { selectedUserIdSet } = selectedUserSlice.actions

export const selectSelectedUserId = (state: RootState) => state.selectedUser.selectedUserId

export default selectedUserSlice.reducer