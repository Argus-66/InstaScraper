import { useState, useEffect } from 'react';

export const useDemographics = (username, followers) => {
  const [demographics, setDemographics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDemographics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🌍 [Demographics] Fetching data for ${username} (${followers} followers)`);
      
      const response = await fetch('/api/AI/demographics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, followers }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      console.log(`✅ [Demographics] Data received for ${username}:`, data);
      setDemographics(data.demographics || []);
      
    } catch (err) {
      console.error(`❌ [Demographics] Error for ${username}:`, err);
      setError(err.message);
      
      // Set fallback data
      setDemographics([
        { country: 'Global', percentage: 100, color: '#6b7280' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;
    fetchDemographics();
  }, [username, followers]);

  return { 
    demographics, 
    loading, 
    error, 
    refetch: fetchDemographics 
  };
};