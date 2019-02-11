export interface RequestError {
  non_field_errors: string[] | null;
}

export interface CourseConfig {
  show_gpa: boolean;
  show_username: boolean;
  rank_limit: number;
}

export interface Course {
  pk: number;
  name: string;
  year: number;
  config: CourseConfig;
  users: User[];
  is_admin: boolean;
}

export interface Year {
  pk: number;
  year: number;
  courses: Course[];
}

export interface User {
  pk: number;
  username: string;
  email: string;
  screen_name: string;
  gpa: number | null;
  is_admin: boolean;
  joined: boolean;
  courses: Course[];
}

export interface Lab {
  pk: number;
  name: string;
  capacity: number;
  rank_set: User[];
}
