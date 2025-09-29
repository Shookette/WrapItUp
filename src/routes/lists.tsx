import { createFileRoute } from '@tanstack/react-router'
import { getLists, getMyLists } from '../repository/ListRepository.ts'
import { isAuthenticated } from '../utils/routeUtils.ts'
import { useCallback, useMemo } from 'react'
import { Container, Paper, Table, Title } from '@mantine/core'
import { List } from '../interfaces/List.ts'
import { useUserContext } from '../hooks/UserContext.tsx'
import ListTableComponent from '../components/ListTable.tsx'

export const Route = createFileRoute('/lists')({
  component: ListsComponent,
  loader: getLists,
  beforeLoad: ({ context }) => {
    isAuthenticated(context)
  },
})

function ListsComponent() {
  const lists = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const { user } = useUserContext()

  const redirectTo = useCallback(
    (list: List) => {
      if (list.userUID === user?.uid) {
        return navigate({
          to: '/edit/$listId',
          params: { listId: list.id },
        })
      }

      return navigate({ to: '/list/$listId', params: { listId: list.id } })
    },
    [navigate],
  )

  return (
    <Container>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2}>Listes de cadeaux</Title>
        <ListTableComponent lists={lists} onRedirect={redirectTo} />
      </Paper>
    </Container>
  )
}
