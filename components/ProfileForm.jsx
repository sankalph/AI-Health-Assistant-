import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProfileForm({ user }) {
  const [profile, setProfile] = useState({ name: '', age: '', gender: '', address: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(prev => ({ ...prev, ...snap.data() }));
      setLoading(false);
    }
    load();
  }, [user]);

  async function save(e) {
    e.preventDefault();
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, { ...profile }, { merge: true });
    alert('Profile saved');
  }

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={save} className="space-y-3">
      <label className="block text-sm">Name</label>
      <input value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} className="w-full p-2 border rounded" />

      <label className="block text-sm">Age</label>
      <input value={profile.age} onChange={e=>setProfile({...profile, age:e.target.value})} className="w-full p-2 border rounded" />

      <label className="block text-sm">Gender</label>
      <select value={profile.gender} onChange={e=>setProfile({...profile, gender:e.target.value})} className="w-full p-2 border rounded">
        <option value="">Select</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>

      <label className="block text-sm">Address</label>
      <textarea value={profile.address} onChange={e=>setProfile({...profile, address:e.target.value})} className="w-full p-2 border rounded" />

      <button type="submit" className="btn-primary">Save Profile</button>
    </form>
  );
}
