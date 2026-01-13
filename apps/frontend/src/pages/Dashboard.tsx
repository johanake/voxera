import { Link } from 'react-router-dom'
import { Card, Badge } from '../components/ui'

const Dashboard = () => {
  // Mock data - in a real app, this would come from API
  const stats = {
    users: {
      total: 47,
      active: 42,
      invited: 3,
      suspended: 2,
    },
    licenses: {
      total: 52,
      active: 35,
      unassigned: 17,
      limit: 100,
    },
    numbers: {
      total: 38,
      active: 31,
      reserved: 5,
      porting: 2,
    },
    recentActivity: [
      {
        id: 1,
        type: 'user',
        action: 'User created',
        description: 'Jane Smith was added to the system',
        timestamp: '2 hours ago',
      },
      {
        id: 2,
        type: 'license',
        action: 'License assigned',
        description: 'Mobile Professional - Pro assigned to John Doe',
        timestamp: '4 hours ago',
      },
      {
        id: 3,
        type: 'number',
        action: 'Number purchased',
        description: '+46 70 555 1234 added to inventory',
        timestamp: '5 hours ago',
      },
      {
        id: 4,
        type: 'number',
        action: 'Porting completed',
        description: '+46 8 555 9876 successfully ported',
        timestamp: '1 day ago',
      },
    ],
    licenseBreakdown: [
      { name: 'Mobile Professional - Pro', count: 15, percentage: 29 },
      { name: 'Mobile Professional - Premium', count: 8, percentage: 15 },
      { name: 'PBX Basic - Advanced', count: 12, percentage: 23 },
      { name: 'Mobile Professional - Free', count: 10, percentage: 19 },
      { name: 'PBX Basic - Basic', count: 7, percentage: 14 },
    ],
    numberBreakdown: [
      { type: 'Mobile', count: 18, color: 'bg-primary-300' },
      { type: 'Geographic', count: 12, color: 'bg-green-500' },
      { type: 'Toll-Free', count: 6, color: 'bg-purple-500' },
      { type: 'National', count: 2, color: 'bg-yellow-500' },
    ],
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      user: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      license: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      number: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    }
    return icons[type] || icons.user
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your UCaaS platform.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Users Card */}
        <Link to="/users">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.users.total}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="success" size="sm">{stats.users.active} active</Badge>
                  {stats.users.invited > 0 && (
                    <Badge variant="warning" size="sm">{stats.users.invited} invited</Badge>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </Link>

        {/* Licenses Card */}
        <Link to="/licenses">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Licenses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.licenses.total}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="success" size="sm">{stats.licenses.active} assigned</Badge>
                  <Badge variant="warning" size="sm">{stats.licenses.unassigned} free</Badge>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Utilization</span>
                <span>{stats.licenses.total}/{stats.licenses.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(stats.licenses.total / stats.licenses.limit) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </Link>

        {/* Phone Numbers Card */}
        <Link to="/numbers">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Phone Numbers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.numbers.total}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="success" size="sm">{stats.numbers.active} active</Badge>
                  {stats.numbers.porting > 0 && (
                    <Badge variant="info" size="sm">{stats.numbers.porting} porting</Badge>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </Card>
        </Link>

        {/* Quick Stats Card */}
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">System Health</p>
              <p className="text-3xl font-bold text-primary-900 mt-1">98.7%</p>
              <p className="text-xs text-primary-700 mt-2">All services operational</p>
            </div>
            <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'user' ? 'bg-primary-50 text-primary-500' :
                      activity.type === 'license' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column Stats */}
        <div className="space-y-6">
          {/* License Breakdown */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">License Distribution</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.licenseBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 truncate">{item.name}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-300 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Number Breakdown */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Numbers by Type</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats.numberBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-600">{item.type}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Total</span>
                  <span className="text-sm font-bold text-gray-900">{stats.numbers.total}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
