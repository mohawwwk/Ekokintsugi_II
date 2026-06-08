import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import Loading from '../components/Loading';

export default function AdminPoints() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsAction, setPointsAction] = useState('add');
  const [points, setPoints] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || !points) return;
    
    setError('');
    setSuccess('');

    try {
      if (pointsAction === 'add') {
        await api.post('/points/add', {
          userId: selectedUser.id,
          points: parseInt(points)
        });
        setSuccess(`Added ${points} points to ${selectedUser.name}`);
      } else {
        await api.put('/points/redeem', {
          userId: selectedUser.id,
          points: parseInt(points)
        });
        setSuccess(`Redeemed ${points} points from ${selectedUser.name}`);
      }
      setPoints('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update points');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Layout showBack title="Manage Points">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Point Balances</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <div className="grid gap-4">
            {users.map(user => (
              <Card key={user.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">{user.pointsRemaining}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Balance</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Total Earned: <span className="font-medium text-gray-700">{user.pointsTotal}</span>
                  </div>
                  <Button 
                    variant="outline"
                    className="text-xs py-1"
                    onClick={() => setSelectedUser(user)}
                  >
                    Adjust Points
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <Card title="Quick Adjust" subtitle="Select a user to update their points">
            {!selectedUser ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">⭐</div>
                <p>Click "Adjust Points" on a user to start</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                  <p className="text-sm text-primary-800 font-medium">{selectedUser.name}</p>
                  <p className="text-xs text-primary-600">Current Balance: {selectedUser.pointsRemaining}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPointsAction('add')}
                        className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                          pointsAction === 'add'
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Add Points
                      </button>
                      <button
                        onClick={() => setPointsAction('redeem')}
                        className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                          pointsAction === 'redeem'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Redeem Points
                      </button>
                    </div>
                  </div>

                  <Input
                    label="Amount"
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="Enter amount..."
                  />

                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => setSelectedUser(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleSubmit}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`Adjust Points for ${selectedUser?.name}`}
        className="md:hidden"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPointsAction('add')}
                  className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                    pointsAction === 'add'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Add Points
                </button>
                <button
                  onClick={() => setPointsAction('redeem')}
                  className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                    pointsAction === 'redeem'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Redeem Points
                </button>
              </div>
            </div>

            <Input
              label="Amount"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Enter amount..."
            />

            <Button 
              className="w-full"
              onClick={handleSubmit}
            >
              Confirm Update
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>;
}
