'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Trophy, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/useAuth'

interface HeaderProps {
  showPoints?: boolean
  points?: number
  onLeaderboardClick?: () => void
}

export default function Header({ showPoints = false, points = 0, onLeaderboardClick }: HeaderProps) {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleLeaderboardClick = () => {
    if (onLeaderboardClick) {
      onLeaderboardClick()
    } else {
      router.push('/leaderboard')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user || !profile) {
    return null
  }

  return (
    <header className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <Link href="/game" className="text-xl font-bold text-white hover:text-gray-300">
          CenterGuessr
        </Link>
        
        {showPoints && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaderboardClick}
            className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 flex items-center space-x-2"
          >
            <Trophy className="h-4 w-4" />
            <span className="font-bold">{points}</span>
            <span className="text-sm">pts</span>
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || ''} />
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {getInitials(profile.display_name || profile.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm">{profile.display_name}</p>
                <p className="w-[200px] truncate text-xs text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/leaderboard" className="cursor-pointer">
                <Trophy className="mr-2 h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}