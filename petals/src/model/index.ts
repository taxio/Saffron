export interface RequestError {
  non_field_errors: string[] | null;
}

export interface Course {
  pk: number;
  name: string;
  year: number;
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
