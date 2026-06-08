import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Input from '../components/Input';

export default function ReturnRequest() {
  const [formData, setFormData] = useState({
    shoeId: '',
    reason: '',
    condition: 'Good'
  });
  const [shoe, setShoe] = useState(null);
  const [existingReturns, setExistingReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/user/me');
      setShoe(res.data.shoe);
      if (res.data.shoe) {
        setFormData(prev => ({ ...prev, shoeId: res.data.shoe.id }));
      }
      
      const returnsRes = await api.get('/returns');
      setExistingReturns(returnsRes.data.returns || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/returns/request', formData);
      success('Return request submitted successfully');
      navigate('/dashboard');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit request');
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
