// hooks/use-admin-role.ts

'use client';

import { useState, useEffect } from 'react';
// Assuming createClient and useAuth exist from prior steps
import { createClient } from '@/lib/supabase/client'; 
import { useAuth } from '@/components/auth-provider'; 
import { User } from '@supabase/supabase-js'; // Import User type

export function useAdminRole() {
  const { user, loading } = useAuth();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    // 1. Check Auth State and Loading
    if (loading) {
      setRoleLoading(true);
      return;
    }
    
    // If no user is logged in, they cannot be an admin. Exit immediately.
    if (!user) {
      setIsAdmin(false);
      setRoleLoading(false);
      return;
    }

    async function fetchRole(currentUser: User) {
      setRoleLoading(true);
      
      // FIX: The database query is now safely inside a block where 'currentUser' is guaranteed to be non-null.
      // This is necessary because the User object returned by useAuth is asynchronous.
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id) // Accessing ID is now safe
        .single();
      
      // If no role found, or role is not 'admin', default to false
      if (error || data?.role !== 'admin') {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
      setRoleLoading(false);
    }

    // Call the fetch function, passing the non-null user object
    fetchRole(user);

  }, [user, loading, supabase]);

  // Returns true if the user is admin (and loading state)
  return { isAdmin, roleLoading };
}