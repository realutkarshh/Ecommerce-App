'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/app/context/user-context';
import { getUserProfile, updateUserProfile } from '@/lib/api';

export default function ProfilePage() {
  const { user } = useUser();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.token) return;
      try {
        const data = await getUserProfile(user.token);
        setUsername(data.username);
        setEmail(data.email);
        setContact(data.contact);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile.');
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    setError('');
    setSuccess('');
    try {
      await updateUserProfile(user.token, { username, email, contact });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Contact</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
