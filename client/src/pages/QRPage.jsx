import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Loading from '../components/Loading';

export default function QRPage() {
  const { userId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQRData();
  }, [userId]);

  const fetchQRData = async () => {
    try {
      const response = await api.get(`/qr/${userId}`);
      setQrData(response.data);
    } catch (err) {
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="text-center max-w-sm">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The QR code is invalid or the user no longer exists.</p>
          <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">EkoKintsugi</h1>
          <p className="text-gray-600">Founding Circle Member</p>
        </div>

        <Card>
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{qrData?.name}</h2>
            <p className="text-sm text-gray-600 uppercase tracking-wider font-bold text-primary-600">
              {qrData?.data?.role}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <img
                src={qrData?.qrCode}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary-700">{qrData?.data?.points?.remaining}</p>
              <p className="text-xs text-primary-600">Points</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{qrData?.data?.reviewsCompleted}/{qrData?.data?.maxReviews}</p>
              <p className="text-xs text-green-600">Reviews</p>
            </div>
          </div>

          {qrData?.data?.shoe && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👟</span>
                <div>
                  <p className="font-medium text-gray-900">{qrData.data.shoe.productLine}</p>
                  <p className="text-sm text-gray-600">Size {qrData.data.shoe.size}</p>
                </div>
              </div>
              <Badge variant={qrData.data.shoe.status === 'Delivered' ? 'success' : 'warning'}>
                {qrData.data.shoe.status}
              </Badge>
            </div>
          )}

          {qrData?.data?.tree && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🌳</span>
                <div>
                  <p className="font-medium text-gray-900">{qrData.data.tree.plantType}</p>
                  <p className="text-sm text-gray-600">{qrData.data.tree.location}</p>
                </div>
              </div>
              <Badge variant="success">{qrData.data.tree.status}</Badge>
            </div>
          )}
        </Card>

        <div className="text-center mt-8">
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
