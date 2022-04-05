import { CompanyShare, User } from '@prisma/client'
import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { RootState } from './store'

const companySharesAdapter = createEntityAdapter<CompanyShare>({
    selectId: (user) => user.id,
    sortComparer: (a, b) => a.id - b.id,
})

const companySharesSlice = createSlice({
    name: 'companyShares',
    initialState: companySharesAdapter.getInitialState(),
    reducers: {
        companySharesReceived(state, action: PayloadAction<CompanyShare[]>) {
            companySharesAdapter.setAll(state, action.payload);
        },
        companyShareUpdated: companySharesAdapter.updateOne,
        companySharesUpdated: companySharesAdapter.updateMany
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            state.entities = action.payload.companyShares.entities;
            state.ids = action.payload.companyShares.ids;
        }
    }
})

// Export the customized selectors for this adapter using `getSelectors`
export const {
    selectAll: selectAllCompanyShares,
    selectById: selectCompanyShareById,
    selectIds: selectCompanyShareIds
    // Pass in a selector that returns the posts slice of state
  } = companySharesAdapter.getSelectors<RootState>(state => state.companyShares)

export const { companySharesReceived, companyShareUpdated, companySharesUpdated } = companySharesSlice.actions

export default companySharesSlice.reducer