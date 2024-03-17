export default function route(page: string) {
  switch (page) {
    case '':
      return '/dashboard'

    case 'users':
      import('./pages/sv-user-management')
      return page
  }
}
