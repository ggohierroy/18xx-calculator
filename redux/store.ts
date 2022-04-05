import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { createWrapper } from 'next-redux-wrapper';
import gameReducer from './gameSlice'
import usersReducer from './usersSlice'
import selectedUserReducer from './selectedUserSlice'
import companiesReducer from './companiesSlice'
import companySharesReducer from './companySharesSlice'
import logsReducer from './logsSlice'

// wrap the configuration of the store inside a makeStore function
// this will be used to create a new store client or server-side with redux-wrapper
const makeStore = () =>
    configureStore({
        reducer: {
            game: gameReducer,
            users: usersReducer,
            selectedUser: selectedUserReducer,
            companies: companiesReducer,
            companyShares: companySharesReducer,
            logs: logsReducer
        }
    })

export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore['dispatch']

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(makeStore);