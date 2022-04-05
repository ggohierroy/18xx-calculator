import { Log, User } from '@prisma/client'
import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from './store'

const logsAdapter = createEntityAdapter<Log>({
    selectId: (user) => user.id,
    // casting as any since the property is in reality a string
    // this comes from the prisma middleware that does toISOString
    // this is to bypass NextJS complaining about serializing dates
    sortComparer: (a, b) => Date.parse(a.createdTime as any) - Date.parse(b.createdTime as any),
})

const logsSlice = createSlice({
    name: 'logs',
    initialState: logsAdapter.getInitialState(),
    reducers: {
        logsReceived(state, action: PayloadAction<Log[]>) {
            logsAdapter.setAll(state, action.payload);
        },
        logsUpdated: logsAdapter.updateOne,
        logUpdated: logsAdapter.updateMany,
        logAdded: logsAdapter.upsertOne,
        logRemoved: logsAdapter.removeOne
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            state.entities = action.payload.logs.entities;
            state.ids = action.payload.logs.ids;
        }
    }
})

// Export the customized selectors for this adapter using `getSelectors`
export const {
    selectAll: selectAllLogs,
    selectById: selectLogById,
    selectIds: selectLogIds
    // Pass in a selector that returns the posts slice of state
  } = logsAdapter.getSelectors<RootState>(state => state.logs)

export const { logsReceived, logUpdated, logsUpdated, logAdded, logRemoved } = logsSlice.actions

export default logsSlice.reducer