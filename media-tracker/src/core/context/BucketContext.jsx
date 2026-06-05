import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const BucketContext = createContext();

export const BucketProvider = ({ session, children }) => {
  const [buckets, setBuckets] = useState([]);

  useEffect(() => {
    if (!session) return;
    const fetchBuckets = async () => {
      const { data } = await supabase
        .from('bucket_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
      if (data) setBuckets(data);
    };
    fetchBuckets();
  }, [session]);

  const addToBucket = async (movieData) => {
    const { data, error } = await supabase
      .from('bucket_logs')
      .insert([{ ...movieData, user_id: session.user.id }])
      .select();
    if (!error && data) setBuckets([data[0], ...buckets]);
  };

  const updateBucket = async (id, updatedMovie) => {
    const { error } = await supabase
      .from('bucket_logs')
      .update({ items: [updatedMovie] })
      .eq('id', id);
    if (!error) setBuckets(prev => prev.map(b => b.id === id ? { ...b, items: [updatedMovie] } : b));
  };

  const removeFromBucket = async (id) => {
    await supabase.from('bucket_logs').delete().eq('id', id);
    setBuckets(prev => prev.filter(b => b.id !== id));
  };

  return (
    <BucketContext.Provider value={{ buckets, addToBucket, updateBucket, removeFromBucket }}>
      {children}
    </BucketContext.Provider>
  );
};

export const useBuckets = () => useContext(BucketContext);