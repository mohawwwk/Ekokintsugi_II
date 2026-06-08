import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/user/me');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
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

  const progress = data ? (data.user.reviewsCompleted / data.user.maxReviews) * 100 : 0;

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Welcome, {data?.user?.name}</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👟</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Shoe</p>
                <p className="font-semibold text-gray-900">
                  {data?.shoe?.productLine || 'Not Assigned'}
                </p>
              </div>
            </div>
            {data?.shoe && (
              <div className="text-sm text-gray-600 space-y-1">
                <p>ID: {data.shoe.shoeId}</p>
                <p>Size: {data.shoe.size}</p>
                <Badge variant={
                  data.shoe.status === 'Delivered' ? 'success' :
                  data.shoe.status === 'PreBooked' ? 'warning' :
                  'gray'
                }>
                  {data.shoe.status}
                </Badge>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌳</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Tree</p>
                <p className="font-semibold text-gray-900">
                  {data?.tree?.plantType || 'Pending'}
                </p>
              </div>
            </div>
            {data?.tree && (
              <div className="text-sm text-gray-600 space-y-1">
                <p>ID: {data.tree.treeId}</p>
                <p>Location: {data.tree.location}</p>
                <Badge variant="success">{data.tree.status}</Badge>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Circle Points</p>
                <p className="font-semibold text-gray-900">{data?.user?.pointsRemaining}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Total Earned: {data?.user?.pointsTotal}</p>
              <p>Total Used: {data?.user?.pointsUsed}</p>
              <Link to="/qr" className="text-primary-600 hover:underline inline-block mt-1">
                View My QR Code →
              </Link>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card title="Review Status">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Weekly Reviews</span>
              <span className="font-medium text-gray-900">
                {data?.user?.reviewsCompleted} / {data?.user?.maxReviews}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              {data?.user?.reviewsCompleted < data?.user?.maxReviews ? (
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                  <p className="text-sm text-primary-800 mb-3">
                    Submit your week {data?.user?.reviewsCompleted + 1} review to earn 10 points!
                  </p>
                  <Link to="/review" className="btn-primary inline-block text-center w-full">
                    Start Weekly Review
                  </Link>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-800">
                    You've completed all weekly reviews for this cycle. Great job!
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/return"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <span className="text-2xl mb-2">📦</span>
                <span className="text-sm font-medium text-gray-900">Return Shoe</span>
              </Link>
              <Link
                to="/qr"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <span className="text-2xl mb-2">📱</span>
                <span className="text-sm font-medium text-gray-900">My QR Code</span>
              </Link>
            </div>
          </Card>
        </div>

        {data?.reviews?.length > 0 && (
          <div className="card mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Reviews</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Week</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Days Worn</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Hours/Day</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Comfort</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Fit</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.reviews.slice(0, 4).map((review) => (
                    <tr key={review.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 font-medium">Week {review.weekNumber}</td>
                      <td className="py-2 px-3">{review.daysWorn}</td>
                      <td className="py-2 px-3">{review.hoursPerDay}</td>
                      <td className="py-2 px-3">{review.comfort}/10</td>
                      <td className="py-2 px-3">{review.fit}/10</td>
                      <td className="py-2 px-3 text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
