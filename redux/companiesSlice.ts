import { Company, CompanyShare, Prisma, User } from '@prisma/client'
import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'
import { companySharesReceived } from './companySharesSlice'
import { AppThunk, RootState } from './store'

type CompanyWithShares = Prisma.CompanyGetPayload<{
    include: {
        companyShares: true
    }
}>

type CompanyWithSharesByUser = Company & {
    sharesByUserId: Record<number, { userId: number, shareId: number }>
}

const companiesAdapter = createEntityAdapter<CompanyWithSharesByUser>({
    selectId: (user) => user.id,
    sortComparer: (a, b) => a.companyCode.localeCompare(b.companyCode),
})

const companiesSlice = createSlice({
    name: 'companies',
    initialState: companiesAdapter.getInitialState(),
    reducers: {
        companiesReceived(state, action: PayloadAction<CompanyWithSharesByUser[]>) {
            companiesAdapter.setAll(state, action.payload);
        },
        companyUpdated: companiesAdapter.updateOne,
        companiesUpdated: companiesAdapter.updateMany,
        companiesSumReset(state) {
            Object.values(state.entities).forEach(company => {
                company!.cumulativeReceived = 0;
            });
        }
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            state.entities = action.payload.companies.entities;
            state.ids = action.payload.companies.ids;
        }
    }
})

export const denormalizedCompaniesReceived =
    (companiesWithShares: CompanyWithShares[]): AppThunk =>
    async dispatch => {

        let allCompanyShares: CompanyShare[] = [];
        const companies = companiesWithShares.map(company => {
            const {companyShares, ...companyWithoutShares} = company;
            allCompanyShares.push(...companyShares);
            let sharesByUserId: Record<number, { userId: number, shareId: number }> = {};
            companyShares.forEach(share => {
                sharesByUserId[share.userId] = { userId: share.userId, shareId: share.id };
            })
            return {
                ...companyWithoutShares,
                sharesByUserId: sharesByUserId
            }
        })

        dispatch(companySharesReceived(allCompanyShares));
        dispatch(companiesReceived(companies));
    };

// Export the customized selectors for this adapter using `getSelectors`
export const {
    selectAll: selectAllCompanies,
    selectById: selectCompanyById,
    selectIds: selectCompanyIds
    // Pass in a selector that returns the posts slice of state
  } = companiesAdapter.getSelectors<RootState>(state => state.companies)

export const { companiesReceived, companyUpdated, companiesUpdated, companiesSumReset } = companiesSlice.actions

export default companiesSlice.reducer