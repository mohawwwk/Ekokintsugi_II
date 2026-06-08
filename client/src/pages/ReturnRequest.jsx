import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Input from '../components/Input';

export default function ReturnRequest() {
  const navigate = useNavigate();
  const [shoe, setShoe] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    condition: 'Good'
  });
  const [existingReturns, setExistingReturns] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/user/me');
      setShoe(response.data.shoe);
      setExistingReturns(response.data.user?.returns || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!shoe) {
      setError('No shoe assigned to your account');
      setLoading(false);
      return;
    }

    try {
      await api.post('/returns/request', {
        shoeId: shoe.id,
        reason: formData.reason,
        condition: formData.condition
      });
      setSuccess('Return request submitted successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      Requested: 'warning',
      Approved: 'info',
      Received: 'purple',
      Completed: 'success'
    };
    return variants[status] || 'gray';
  };

  return (
    <Layout showBack title="Return Request">
      <div className="max-w-2xl mx-auto">
        {existingReturns.length > 0 && (
          <Card title="Your Return Requests" className="mb-6">
            <div className="space-y-3">
              {existingReturns.map(ret => (
                <div key={ret.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ret.reason}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(ret.status)}>{ret.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="New Return Request">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
              <p className="text-sm text-gray-600 mb-1">Returning Asset:</p>
              <p className="font-semibold text-gray-900">
                {shoe ? `${shoe.productLine} (${shoe.shoeId})` : 'Loading...'}
              </p>
            </div>

            <Input
              label="Reason for Return"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Why are you returning the shoe?"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shoe Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="Good">Good</option>
                <option value="Worn">Worn</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Submit Request
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
