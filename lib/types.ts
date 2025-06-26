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
    projects: projects,
}

export interface users {
    id: Generated<number>
    email: string
    password_hash: string
    created_at: ColumnType<Date, string | undefined, never>
    username: string
    avatar_url: string | null
    type: boolean // true = corporation, false = individual
}

export interface projects {
    id: Generated<number>;
    user_id: string | undefined;
    project_name: string;
    project_description: string;
    skills_required: string[];
    budget: string | null;
    timeline: string | null;
    status: string;
    created_at: ColumnType<Date, string | undefined, never>;
}

export type User = Selectable<users>
export type NewUser = Insertable<users>
export type UpdateUser = Updateable<users>

export type Project = Selectable<projects>
export type NewProject = Insertable<projects>
export type UpdateProject = Updateable<projects>