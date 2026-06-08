import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';

export default function WeeklyReview() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    weekNumber: 1,
    daysWorn: 5,
    hoursPerDay: 8,
    comfort: 7,
    fit: 7,
    sole: 7,
    material: 7,
    stitching: 7,
    feedback: ''
  });
  const [existingReviews, setExistingReviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/user/me');
      setExistingReviews(response.data.reviews || []);
      
      const nextWeek = (response.data.reviews?.length || 0) + 1;
      if (nextWeek > 8) {
        setError('You have completed all 8 weekly reviews!');
      } else {
        setFormData(prev => ({ ...prev, weekNumber: nextWeek }));
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/reviews', formData);
      setSuccess('Review submitted successfully! You earned 10 points.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getWeekStatus = (week) => {
    const review = existingReviews.find(r => r.weekNumber === week);
    return review ? 'completed' : 'pending';
  };

  return (
    <Layout showBack title="Weekly Review">
      <div className="max-w-2xl mx-auto">
        <Card title="Review Progress" className="mb-6">
          <div className="flex gap-2">
            {[1,2,3,4,5,6,7,8].map(week => (
              <div
                key={week}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
                  getWeekStatus(week) === 'completed'
                    ? 'bg-primary-600 text-white'
                    : formData.weekNumber === week
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {week}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {existingReviews.length} of 8 reviews completed. You earn 10 points for each review.
          </p>
        </Card>

        <Card title={`Week ${formData.weekNumber} Review`}>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Days Worn"
                type="number"
                name="daysWorn"
                value={formData.daysWorn}
                onChange={handleChange}
                min="0"
                max="7"
                required
              />
              <Input
                label="Hours Per Day"
                type="number"
                name="hoursPerDay"
                value={formData.hoursPerDay}
                onChange={handleChange}
                min="0"
                max="24"
                required
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b border-gray-100 pb-2">Ratings (1-10)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Comfort', name: 'comfort' },
                  { label: 'Fit', name: 'fit' },
                  { label: 'Sole Durability', name: 'sole' },
                  { label: 'Material Quality', name: 'material' },
                  { label: 'Stitching', name: 'stitching' }
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-sm text-gray-600 mb-1">{field.label}</label>
                    <input
                      type="range"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      className="w-full accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span className="font-bold text-primary-600">{formData[field.name]}</span>
                      <span>10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Feedback</label>
              <textarea
                name="feedback"
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 h-24 resize-none"
                placeholder="Any specific comments about the shoe's performance this week?"
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              disabled={formData.weekNumber > 8}
            >
              Submit Review
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
  }
