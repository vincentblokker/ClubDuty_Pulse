import React from 'react'
import { useAuth } from '../store/auth'
import { MobileNavigation, ThemeController } from '../components/MobileNavigation'

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-base-200)' }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: 'var(--color-base-100)', borderBottom: '1px solid color-mix(in oklab, var(--color-base-content) 15%, transparent)' }}>
        <div className="container mx-auto">
          <div className="flex justify-between items-center py-4">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-responsive-2xl font-bold" style={{ color: 'var(--color-base-content)' }}>
                <span className="md:hidden">Pulse</span>
                <span className="hidden md:inline">ClubDuty Pulse Dashboard</span>
              </h1>
            </div>

            {/* Desktop User Info & Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <MobileNavigation />
              <ThemeController />
              <div className="flex items-center space-x-4">
                <span className="text-sm" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>
                  Team: <span className="font-medium" style={{ color: 'var(--color-base-content)' }}>{user?.teamCode}</span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm rounded-md transition-colors touch-target"
                  style={{ 
                    color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-base-content)';
                    e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--color-base-content) 10%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'color-mix(in oklab, var(--color-base-content) 70%, transparent)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile User Info */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeController />
              <span className="text-sm font-medium" style={{ color: 'var(--color-base-content)' }}>
                {user?.teamCode}
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-md touch-target"
                style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 md:py-8">
        <div className="grid grid-responsive-3 gap-4 md:gap-6">
          {/* Welcome Card */}
          <div className="mobile-card" style={{ backgroundColor: 'var(--color-base-100)' }}>
            <h2 className="text-responsive-lg font-semibold mb-2" style={{ color: 'var(--color-base-content)' }}>Welcome back!</h2>
            <p className="text-sm" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>
              You're successfully logged in as a coach for team <span className="font-medium" style={{ color: 'var(--color-base-content)' }}>{user?.teamCode}</span>.
            </p>
          </div>

          {/* Quick Stats Card */}
          <div className="mobile-card" style={{ backgroundColor: 'var(--color-base-100)' }}>
            <h3 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--color-base-content)' }}>Team Overview</h3>
            <div className="space-y-3">
              <div className="mobile-layout">
                <span className="text-sm" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>Active Rounds:</span>
                <span className="font-medium text-sm" style={{ color: 'var(--color-base-content)' }}>3</span>
              </div>
              <div className="mobile-layout">
                <span className="text-sm" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>Team Members:</span>
                <span className="font-medium text-sm" style={{ color: 'var(--color-base-content)' }}>5</span>
              </div>
              <div className="mobile-layout">
                <span className="text-sm" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>Pending Feedback:</span>
                <span className="font-medium text-sm" style={{ color: 'var(--color-base-content)' }}>20</span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="mobile-card" style={{ backgroundColor: 'var(--color-base-100)' }}>
            <h3 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--color-base-content)' }}>Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/rounds"
                className="btn-mobile w-full transition-colors text-center block"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-content)' }}
              >
                Manage Rounds
              </a>
              <button className="btn-mobile w-full transition-colors" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-success-content)' }}>
                View Progress
              </button>
              <button className="btn-mobile w-full transition-colors" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-secondary-content)' }}>
                Export Reports
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mobile-card mt-6 md:mt-8" style={{ backgroundColor: 'var(--color-base-100)' }}>
          <h3 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--color-base-content)' }}>Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-md" style={{ backgroundColor: 'var(--color-base-200)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-success)' }}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-base-content)' }}>New feedback round started</p>
                <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--color-base-content) 60%, transparent)' }}>2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-md" style={{ backgroundColor: 'var(--color-base-200)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-info)' }}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-base-content)' }}>5 team members completed feedback</p>
                <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--color-base-content) 60%, transparent)' }}>4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-md" style={{ backgroundColor: 'var(--color-base-200)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-warning)' }}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-base-content)' }}>Assignment algorithm generated</p>
                <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--color-base-content) 60%, transparent)' }}>1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
