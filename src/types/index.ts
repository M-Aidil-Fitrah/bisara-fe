export interface Account {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}
