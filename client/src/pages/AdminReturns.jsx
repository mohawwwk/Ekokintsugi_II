import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Loading from '../components/Loading';

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', finalAction: '' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await api.get('/returns');
      setReturns(response.data.returns);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/returns/update/${selectedReturn.id}`, updateData);
      setSuccess('Return updated successfully!');
      setSelectedReturn(null);
      setUpdateData({ status: '', finalAction: '' });
      fetchReturns();
    } catch (error) {
      console.error('Failed to update return:', error);
    }
  };

  const openUpdateModal = (ret) => {
    setSelectedReturn(ret);
    setUpdateData({ status: ret.status, finalAction: ret.finalAction || '' });
  };

  const getStatusVariant = (status) => {
    const variants = {
      Requested: 'warning',
      Approved: 'info',
      Received: 'purple',
      Completed: 'success'
    };
    return variants[status] || 'gray';
  };

  const getConditionVariant = (condition) => {
    const variants = {
      Good: 'success',
      Fair: 'warning',
      Damaged: 'danger'
    };
    return variants[condition] || 'gray';
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Layout showBack title="Manage Returns">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {returns.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Returns Yet</h2>
          <p className="text-gray-600">There are no return requests at the moment.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {returns.map(ret => (
            <Card key={ret.id}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">{ret.user?.name}</h3>
                    <Badge variant={getStatusVariant(ret.status)}>{ret.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Reason:</span> {ret.reason}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-xs text-gray-400 block">Asset ID</span>
                      <span className="text-sm font-medium">{ret.shoe?.shoeId}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-xs text-gray-400 block">Condition</span>
                      <Badge variant={getConditionVariant(ret.condition)}>{ret.condition}</Badge>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="text-xs text-gray-400 block">Date</span>
                      <span className="text-sm font-medium">{new Date(ret.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[150px]">
                  <Button onClick={() => openUpdateModal(ret)}>
                    Update Status
                  </Button>
                  {ret.finalAction && (
                    <p className="text-[10px] text-gray-400 italic text-center">
                      Last Action: {ret.finalAction}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedReturn}
        onClose={() => setSelectedReturn(null)}
        title="Update Return Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={updateData.status}
              onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
            >
              <option value="Requested">Requested</option>
              <option value="Approved">Approved</option>
              <option value="Received">Received</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Action / Notes</label>
            <textarea
              value={updateData.finalAction}
              onChange={(e) => setUpdateData({ ...updateData, finalAction: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none h-24 resize-none"
              placeholder="e.g. Refurbished and re-sold, Donated..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setSelectedReturn(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpdate}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
