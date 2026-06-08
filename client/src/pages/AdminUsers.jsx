import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import Loading from '../components/Loading';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { success, error: toastError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'supporter',
    city: '',
    address: '',
    shoeSize: ''
  });

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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/admin/create-user', formData);
      success('User created successfully!');
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'supporter',
        city: '',
        address: '',
        shoeSize: ''
      });
      fetchUsers();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const getRoleVariant = (role) => {
    const variants = {
      admin: 'purple',
      intern: 'info',
      team: 'success',
      supporter: 'gray'
    };
    return variants[role] || 'gray';
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Layout 
      showBack 
      title="Manage Users"
    >
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setShowModal(true)}
          disabled={users.length >= 10}
        >
          Create User ({users.length}/10)
        </Button>
      </div>

      <div className="grid gap-6">
        {users.map(user => (
          <Card key={user.id}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="bg-gray-50 px-3 py-1 rounded-lg">
                  <span className="text-xs text-gray-400 block">Location</span>
                  {user.city || 'Not set'}
                </div>
                <div className="bg-gray-50 px-3 py-1 rounded-lg">
                  <span className="text-xs text-gray-400 block">Points</span>
                  {user.pointsRemaining}
                </div>
                <div className="bg-gray-50 px-3 py-1 rounded-lg">
                  <span className="text-xs text-gray-400 block">Asset</span>
                  {user.shoe?.shoeId || 'No shoe'}
                </div>
              </div>

              <Link 
                to={`/qr/${user.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View QR →
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New User"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              >
                <option value="supporter">Supporter</option>
                <option value="team">Team</option>
                <option value="intern">Intern</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Input
              label="Shoe Size"
              name="shoeSize"
              value={formData.shoeSize}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
