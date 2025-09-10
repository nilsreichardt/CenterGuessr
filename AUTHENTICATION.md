# Authentication System

The authentication system has been simplified to provide a clean and straightforward user experience.

## How It Works

### 1. **Simple Flow**
- **Not signed in** → Redirected to `/auth/login`
- **Signed in** → Redirected to `/game`
- **After login** → Profile is automatically created if it doesn't exist

### 2. **Components**

#### `useAuth()` Hook
- Manages authentication state (user, profile, loading)
- Automatically creates user profiles
- Handles sign in/out operations
- Provides redirects after authentication changes

#### `ProtectedRoute` Component
- Wraps pages that require authentication
- Redirects unauthenticated users to login
- Shows loading state while checking auth

#### `PublicRoute` Component
- Wraps pages that should redirect authenticated users
- Redirects signed-in users to game page
- Shows loading state while checking auth

### 3. **Usage Examples**

#### Protected Page (requires auth)
```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function GamePage() {
  return (
    <ProtectedRoute>
      <div>Game content here</div>
    </ProtectedRoute>
  )
}
```

#### Public Page (redirects if signed in)
```tsx
import { PublicRoute } from '@/components/PublicRoute'

export default function LoginPage() {
  return (
    <PublicRoute>
      <div>Login form here</div>
    </PublicRoute>
  )
}
```

#### Using Auth State
```tsx
import { useAuth } from '@/lib/auth/useAuth'

export default function MyComponent() {
  const { user, profile, signOut } = useAuth()
  
  if (!user) return <div>Loading...</div>
  
  return (
    <div>
      <p>Welcome, {profile?.display_name}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### 4. **Profile Creation**
- Profiles are automatically created when users first sign in
- Uses Google OAuth metadata (name, email, avatar)
- No manual profile setup required

### 5. **Domain Restriction**
- Only `@cdtm.com` email addresses are allowed
- Enforced through Google OAuth `hd` parameter
- Invalid domains are automatically signed out

## Benefits

✅ **Simple**: Just wrap pages with route components  
✅ **Automatic**: Profile creation and redirects happen automatically  
✅ **Clean**: No complex authentication logic in individual pages  
✅ **Consistent**: Same pattern across all protected/public pages  
✅ **Type-safe**: Full TypeScript support with proper types  

## Migration

The old `AuthContext` has been replaced with the `useAuth` hook. Update your components:

```tsx
// Old
import { useAuth } from '@/lib/auth/AuthContext'

// New  
import { useAuth } from '@/lib/auth/useAuth'
```

The API is the same, so no other changes are needed.
