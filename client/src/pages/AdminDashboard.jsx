import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Loading from '../components/Loading';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReviews: 0,
    totalReturns: 0,
    pendingReturns: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/users');
      const users = response.data.users;
      
      setStats({
        totalUsers: users.length,
        totalReviews: users.reduce((sum, u) => sum + (u.reviews?.length || 0), 0),
        totalReturns: users.reduce((sum, u) => sum + (u.returns?.length || 0), 0),
        pendingReturns: users.reduce((sum, u) => sum + (u.returns?.filter(r => r.status === 'Requested').length || 0), 0)
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-2">↩️</div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalReturns}</p>
          <p className="text-sm text-gray-600">Total Returns</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingReturns}</p>
          <p className="text-sm text-gray-600">Pending Returns</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">Create and view circle members</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/returns">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Return Requests</h3>
                <p className="text-sm text-gray-600">Process and update shoe returns</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/points">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Points System</h3>
                <p className="text-sm text-gray-600">Manage member reward points</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </Layout>
  );
}
