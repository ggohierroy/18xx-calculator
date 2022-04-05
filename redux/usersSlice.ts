import { User } from '@prisma/client'
import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from './store'

const usersAdapter = createEntityAdapter<User>({
    selectId: (user) => user.id,
    sortComparer: (a, b) => a.name.localeCompare(b.name),
})

const usersSlice = createSlice({
    name: 'users',
    initialState: usersAdapter.getInitialState(),
    reducers: {
        usersReceived(state, action: PayloadAction<User[]>) {
            usersAdapter.setAll(state, action.payload);
        },
        userUpdated: usersAdapter.updateOne,
        usersUpdated: usersAdapter.updateMany,
        usersSumReset(state){
            Object.values(state.entities).forEach(user => {
                user!.cumulativePayout = 0;
            });
        }
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            state.entities = action.payload.users.entities;
            state.ids = action.payload.users.ids;
        }
    }
})

// Export the customized selectors for this adapter using `getSelectors`
export const {
    selectAll: selectAllUsers,
    selectById: selectUserById,
    selectIds: selectUserIds
    // Pass in a selector that returns the posts slice of state
  } = usersAdapter.getSelectors<RootState>(state => state.users)

export const { usersReceived, userUpdated, usersUpdated, usersSumReset } = usersSlice.actions

export default usersSlice.reducer