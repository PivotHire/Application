import {
    ColumnType,
    Generated,
    Insertable,
    JSONColumnType,
    Selectable,
    Updateable,
} from 'kysely'

export interface Database {
    users: UserTable,
    projects: ProjectTable,
    talent_profiles: TalentProfileTable,
    skills: SkillTable,
    talent_skills: TalentSkillTable,
    project_skills: ProjectSkillTable,
}

export interface UserTable {
    id: Generated<string>;
    name: string;
    email: string;
    password_hash: string;
    image: string | null;
    account_type: number; // 1=Business, 2=Talent, 3=Admin, 4=Both
    created_at: ColumnType<Date, string | undefined, never>;
}

export interface ProjectTable {
    id: Generated<number>;
    user_id: string;
    project_name: string;
    project_description: string;
    budget: string | null;
    timeline: string | null;
    skills_required: JSONColumnType<number[]> | null;
    status: string;
    notes: string | null;
    created_at: ColumnType<Date, string | undefined, never>;
}

export interface TalentProfileTable {
    user_id: string;
    headline: string | null;
    bio: string | null;
    location: string | null;
    languages: string[] | null;
    years_of_experience: number | null;
    availability: string | null;
    work_hours_typical: number | null;
    work_hours_max: number | null;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string | null;
    education: ColumnType<unknown, string, string> | null;
    portfolio: ColumnType<unknown, string, string> | null;
    remarks: string | null;
    updated_at: ColumnType<Date, string | undefined, string | undefined>;
}

export interface SkillTable {
    id: Generated<number>;
    name: string;
    category: string | null;
}

export interface TalentSkillTable {
    user_id: string;
    skill_id: number;
}

export interface ProjectSkillTable {
    project_id: number;
    skill_id: number;
}


export interface Database {
    user: UserTable;
    projects: ProjectTable;
    talent_profiles: TalentProfileTable;
    skills: SkillTable;
    talent_skills: TalentSkillTable;
    project_skills: ProjectSkillTable;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;

export type Project = Selectable<ProjectTable>;
export type NewProject = Insertable<ProjectTable>;
export type UpdateProject = Updateable<ProjectTable>;

export type TalentProfile = Selectable<TalentProfileTable>;
export type NewTalentProfile = Insertable<TalentProfileTable>;
export type UpdateTalentProfile = Updateable<TalentProfileTable>;

export type Skill = Selectable<SkillTable>;
export type NewSkill = Insertable<SkillTable>;
export type UpdateSkill = Updateable<SkillTable>;

export type TalentSkill = Insertable<TalentSkillTable>;
export type ProjectSkill = Insertable<ProjectSkillTable>;