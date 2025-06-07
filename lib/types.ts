import {
    ColumnType,
    Generated,
    Insertable,
    JSONColumnType,
    Selectable,
    Updateable,
} from 'kysely'

export interface Database {
    users: users,
}

export interface users {
    id: Generated<number>
    email: string
    password_hash: string
    created_at: ColumnType<Date, string | undefined, never>
    username: string
    nick_name: string | null
    avatar_url: string | null
    type: boolean // true = corporation, false = individual
}

export type User = Selectable<users>
export type NewUser = Insertable<users>
export type UpdateUser = Updateable<users>