# artifact-web

**React + Vite web application template for DEVERSE projects**

Built with React, TypeScript, Vite, Wouter routing, Shadcn UI, and Tailwind CSS.

## Overview

This is a **template repository** for DEVERSE web artifacts. When an agent scaffolds a new web artifact, this template is cloned and customized with:
- Placeholder replacement (%%NAME%%, %%BASE_PATH%%, %%API_URL%%)
- Automatic dependency installation
- Development server startup
- Integration with generated API client and validation schemas

```
artifact-web/
├── lib/                          # Shared libraries (workspace packages)
│   ├── api-client/               # Generated TypeScript client
│   ├── api-zod/                  # Generated Zod validation schemas
│   └── shared-lib/               # Shared types, utils, constants
├── src/
│   ├── lib/
│   │   └── api.ts                # API client configuration
│   ├── pages/                    # Route components
│   │   ├── Home.tsx
│   │   ├── NotFound.tsx
│   │   └── [feature]/             # Feature pages
│   ├── components/
│   │   ├── ui/                    # Shadcn UI components
│   │   └── [feature]/             # Feature components
│   ├── App.tsx                   # Router setup
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── deverse.artifact.json         # Artifact metadata
├── package.json                  # BUN workspaces config
└── tsconfig.json
```

## Setup

### Prerequisites

- Node.js 20+ or BUN
- Access to API server (provided via DATABASE_URL/API_URL env vars)

### Installation

```bash
# BUN workspaces automatically install all lib packages
bun install

# Generate API client + schemas from OpenAPI spec (inherited from API artifact)
bun run generate
```

## Development

### Start the dev server

```bash
bun run dev
```

The app listens on the port specified in `deverse.artifact.json` (default: 3002 for first web artifact).
Access via: `http://localhost:3000/artifacts/{artifact-name}/`

### File Structure

```
src/
├── App.tsx              # Wouter router setup
├── main.tsx             # React entry point
├── pages/               # Route-level components
│   ├── Home.tsx
│   └── NotFound.tsx
├── components/          # Reusable UI components
│   └── ui/              # Shadcn UI library
└── lib/
    └── api.ts           # API client configuration
```

## API Integration

### Configure API Base URL

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const apiClient = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}
```

### Using Generated API Client

```typescript
// src/pages/Users.tsx
import { listUsers, createUser } from '@workspace/api-client'
import { CreateUserSchema } from '@workspace/api-zod'
import { useEffect, useState } from 'react'

export function Users() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    listUsers().then(setUsers)
  }, [])

  const handleCreate = async (name: string) => {
    const data = { name }
    CreateUserSchema.parse(data) // Type-safe validation
    const newUser = await createUser(data)
    setUsers([...users, newUser])
  }

  return (
    <div>
      <h1>Users</h1>
      <button onClick={() => handleCreate('Alice')}>Add User</button>
      <ul>
        {users.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  )
}
```

## Routing

### Wouter Setup

```typescript
// src/App.tsx
import { Router, Route } from 'wouter'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

export default function App() {
  const basePath = import.meta.env.VITE_BASE_PATH || '/'

  return (
    <Router base={basePath}>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Router>
  )
}
```

## UI Components

### Shadcn UI

Install components as needed:

```bash
bun run shadcn-ui add button
bun run shadcn-ui add card
bun run shadcn-ui add form
```

### Example: Form with Validation

```typescript
import { Button } from '@/components/ui/button'
import { CreateUserSchema } from '@workspace/api-zod'
import { createUser } from '@workspace/api-client'
import { useRef } from 'react'

export function CreateUserForm() {
  const nameRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = { name: nameRef.current?.value }

    try {
      CreateUserSchema.parse(formData)
      const user = await createUser(formData)
      console.log('User created:', user)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} placeholder="User name" required />
      <Button type="submit">Create User</Button>
    </form>
  )
}
```

## Styling

### Tailwind CSS

All styles use Tailwind utility classes. Global styles in [src/index.css](src/index.css):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Dark Mode

Shadcn UI supports dark mode via `data-theme` attribute:

```typescript
import { useEffect } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
  }, [isDark])

  return { isDark, setIsDark }
}
```

## Error Handling

### Using Shared Utilities

```typescript
import { getErrorMessage } from '@workspace/shared-lib'

async function fetchData() {
  try {
    const data = await listUsers()
    return data
  } catch (error) {
    const message = getErrorMessage(error)
    console.error('Failed to fetch users:', message)
  }
}
```

## Data Fetching Patterns

### useEffect with State

```typescript
import { useEffect, useState } from 'react'
import { listUsers } from '@workspace/api-client'

export function UsersList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listUsers()
      .then(setData)
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

## Environment Variables

Provided by DEVERSE via container:

```bash
VITE_API_URL=http://api:3001           # API server URL
VITE_BASE_PATH=/artifacts/{artifact}/  # Base path for router
VITE_ENV=production|development        # Environment
```

## Production Build

```bash
bun run build
```

Creates optimized bundle in `dist/`.

## Integration with router.ts

The artifact runs on a dynamic port, and router.ts proxies requests:

```
Browser: http://localhost:3000/artifacts/my-web-app/
  ↓
router.ts matches path and proxies to artifact dev server
  ↓
artifact-web receives request with VITE_BASE_PATH=/artifacts/my-web-app/
  ↓
Wouter router handles client-side navigation within that base
```

## Common Tasks

### Add a new page

1. **Create page component:**
   ```typescript
   // src/pages/Products.tsx
   export default function Products() {
     return <h1>Products</h1>
   }
   ```

2. **Add route:**
   ```typescript
   // src/App.tsx
   import Products from './pages/Products'
   
   <Route path="/products" component={Products} />
   ```

3. **Link to it:**
   ```typescript
   import { Link } from 'wouter'
   
   <Link href="/products">View Products</Link>
   ```

### Add API call

1. **Update OpenAPI spec in API artifact**
2. **Regenerate client:**
   ```bash
   bun run generate
   ```
3. **Use in component:**
   ```typescript
   import { newApiFunction } from '@workspace/api-client'
   ```

### Add UI component

```bash
bun run shadcn-ui add card
```

Then import and use:

```typescript
import { Card } from '@/components/ui/card'

export function MyCard() {
  return <Card>Content</Card>
}
```

## See Also

- [WORKSPACE.md](../deverse_workspace_base/WORKSPACE.md) — Full architecture guide
- [artifact-api](../artifact-api/) — Backend API this frontend consumes
- [lib/api-client](./lib/api-client/) — Generated TypeScript client
- [lib/shared-lib](./lib/shared-lib/) — Shared types and utilities

## License

MIT
