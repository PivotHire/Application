// "use client";
//
// import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
//
// interface User {
//     id: number;
//     email: string;
//     username: string;
//     nick_name?: string | null;
//     avatar_url?: string | null;
// }
//
// interface AuthContextType {
//     isAuthenticated: boolean;
//     user: User | null;
//     isLoading: boolean;
//     login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: Omit<User, 'password_hash'> }>; // Updated user type here
//     logout: () => Promise<void>;
//     refreshAuthStatus: () => Promise<void>;
// }
//
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
//
// export function AuthProvider({ children }: { children: ReactNode }) {
//     const [user, setUser] = useState<User | null>(null);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [isLoading, setIsLoading] = useState(true);
//     const router = useRouter();
//     const pathname = usePathname();
//
//     const fetchUserStatus = useCallback(async () => {
//         setIsLoading(true);
//         try {
//             const response = await fetch('/api/auth/me');
//             if (response.ok) {
//                 const data = await response.json();
//                 if (data.isAuthenticated && data.user) {
//                     setUser(data.user);
//                     setIsAuthenticated(true);
//                 } else {
//                     setUser(null);
//                     setIsAuthenticated(false);
//                 }
//             } else {
//                 setUser(null);
//                 setIsAuthenticated(false);
//             }
//         } catch (error) {
//             console.error('Failed to fetch user status:', error);
//             setUser(null);
//             setIsAuthenticated(false);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);
//
//     useEffect(() => {
//         fetchUserStatus();
//     }, [fetchUserStatus]);
//
//     // useEffect(() => {
//     //     if (!isLoading) {
//     //         if (!isAuthenticated && pathname !== '/signin' && pathname !== '/api/auth/register') {
//     //             router.push('/signin');
//     //         }
//     //     }
//     // }, [isAuthenticated, isLoading, router, pathname]);
//
//     const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
//         setIsLoading(true);
//         try {
//             const response = await fetch('/api/auth/login', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password }),
//             });
//             const data = await response.json();
//
//             if (response.ok) {
//                 await fetchUserStatus();
//                 return { success: true, user: data.user };
//             } else {
//                 return { success: false, error: data.message || 'Login failed' };
//             }
//         } catch (err: any) {
//             console.error(err);
//             return { success: false, error: err.message || 'An error occurred during login.' };
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//
//     const logout = async () => {
//         setIsLoading(true);
//         try {
//             await fetch('/api/auth/logout', { method: 'POST' });
//         } catch (error) {
//             console.error('Logout API call failed:', error);
//         } finally {
//             setUser(null);
//             setIsAuthenticated(false);
//             setIsLoading(false);
//             router.push('/signin');
//         }
//     };
//
//     const refreshAuthStatus = async () => {
//         await fetchUserStatus();
//     };
//
//
//     return (
//         <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, refreshAuthStatus }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }
//
// export function useAuth() {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// }