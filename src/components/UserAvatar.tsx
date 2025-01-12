import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileModal } from './ProfileModal';
import { getFirstTwoNames } from '@/lib/utils';

export function UserAvatar() {
  const { user, setUser, userProfile } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 hover:cursor-pointer">
              <AvatarImage src={userProfile?.avatar_url ?? ""} />
              <AvatarFallback>
                {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {getFirstTwoNames(userProfile?.full_name || user?.email || '')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <User className="w-4 h-4 mr-2 hover:cursor-pointer" />Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2 hover:cursor-pointer" />Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModal 
        open={profileOpen} 
        onOpenChange={setProfileOpen}
        userProfile={userProfile}
      />
    </>
  );
} 