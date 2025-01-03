/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ResetPasswordImport } from './routes/reset-password'
import { Route as RegisterImport } from './routes/register'
import { Route as NewImport } from './routes/new'
import { Route as LoginImport } from './routes/login'
import { Route as IndexImport } from './routes/index'
import { Route as ListListIdImport } from './routes/list.$listId'
import { Route as EditListIdImport } from './routes/edit.$listId'

// Create/Update Routes

const ResetPasswordRoute = ResetPasswordImport.update({
  id: '/reset-password',
  path: '/reset-password',
  getParentRoute: () => rootRoute,
} as any)

const RegisterRoute = RegisterImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const NewRoute = NewImport.update({
  id: '/new',
  path: '/new',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ListListIdRoute = ListListIdImport.update({
  id: '/list/$listId',
  path: '/list/$listId',
  getParentRoute: () => rootRoute,
} as any)

const EditListIdRoute = EditListIdImport.update({
  id: '/edit/$listId',
  path: '/edit/$listId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/new': {
      id: '/new'
      path: '/new'
      fullPath: '/new'
      preLoaderRoute: typeof NewImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      id: '/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterImport
      parentRoute: typeof rootRoute
    }
    '/reset-password': {
      id: '/reset-password'
      path: '/reset-password'
      fullPath: '/reset-password'
      preLoaderRoute: typeof ResetPasswordImport
      parentRoute: typeof rootRoute
    }
    '/edit/$listId': {
      id: '/edit/$listId'
      path: '/edit/$listId'
      fullPath: '/edit/$listId'
      preLoaderRoute: typeof EditListIdImport
      parentRoute: typeof rootRoute
    }
    '/list/$listId': {
      id: '/list/$listId'
      path: '/list/$listId'
      fullPath: '/list/$listId'
      preLoaderRoute: typeof ListListIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/new': typeof NewRoute
  '/register': typeof RegisterRoute
  '/reset-password': typeof ResetPasswordRoute
  '/edit/$listId': typeof EditListIdRoute
  '/list/$listId': typeof ListListIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/new': typeof NewRoute
  '/register': typeof RegisterRoute
  '/reset-password': typeof ResetPasswordRoute
  '/edit/$listId': typeof EditListIdRoute
  '/list/$listId': typeof ListListIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/new': typeof NewRoute
  '/register': typeof RegisterRoute
  '/reset-password': typeof ResetPasswordRoute
  '/edit/$listId': typeof EditListIdRoute
  '/list/$listId': typeof ListListIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/login'
    | '/new'
    | '/register'
    | '/reset-password'
    | '/edit/$listId'
    | '/list/$listId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/login'
    | '/new'
    | '/register'
    | '/reset-password'
    | '/edit/$listId'
    | '/list/$listId'
  id:
    | '__root__'
    | '/'
    | '/login'
    | '/new'
    | '/register'
    | '/reset-password'
    | '/edit/$listId'
    | '/list/$listId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  LoginRoute: typeof LoginRoute
  NewRoute: typeof NewRoute
  RegisterRoute: typeof RegisterRoute
  ResetPasswordRoute: typeof ResetPasswordRoute
  EditListIdRoute: typeof EditListIdRoute
  ListListIdRoute: typeof ListListIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  LoginRoute: LoginRoute,
  NewRoute: NewRoute,
  RegisterRoute: RegisterRoute,
  ResetPasswordRoute: ResetPasswordRoute,
  EditListIdRoute: EditListIdRoute,
  ListListIdRoute: ListListIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/login",
        "/new",
        "/register",
        "/reset-password",
        "/edit/$listId",
        "/list/$listId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/new": {
      "filePath": "new.tsx"
    },
    "/register": {
      "filePath": "register.tsx"
    },
    "/reset-password": {
      "filePath": "reset-password.tsx"
    },
    "/edit/$listId": {
      "filePath": "edit.$listId.tsx"
    },
    "/list/$listId": {
      "filePath": "list.$listId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
