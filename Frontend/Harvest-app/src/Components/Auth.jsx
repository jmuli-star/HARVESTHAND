import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Auth Component (Tailwind Styled)
 * Handles the JWT token exchange from the URL.
 */
function Auth() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = searchParams.get('access');
        const refreshToken = searchParams.get('refresh');
        
        // Optional: Grab role if you sent it from Django
        const userRole = searchParams.get('role');

        if (accessToken && refreshToken) {
            // Save to LocalStorage
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            if (userRole) localStorage.setItem('user_role', userRole);

            // Small delay to let the user see the "Success" state
            const timeout = setTimeout(() => {
                navigate('/dashboard/user');
            }, 1500);

            return () => clearTimeout(timeout);
        } else {
            navigate('/login?error=social_auth_failed');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                {/* Animated Spinner */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
                            <span className="text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Authenticating...
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    We're setting up your Harvest session. You'll be redirected to your dashboard in just a moment.
                </p>

                {/* Progress bar simulation */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-600 h-full animate-pulse transition-all duration-1000" style={{ width: '100%' }}></div>
                </div>
                
                <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest font-semibold">
                    Harvest Project Security
                </p>
            </div>
        </div>
    );
}

export default Auth;