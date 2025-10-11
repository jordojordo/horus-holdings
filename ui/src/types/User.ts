export interface User {
  id?:           string;
  Username?:     string;
  token?:        string;
  [key: string]: unknown;
}
