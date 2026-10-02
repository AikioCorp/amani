import { useEffect } from 'react';

const EnvTest = () => {
  useEffect(() => {
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '*** (key exists)' : 'Not found');
  }, []);

  return (
    <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
      <h2 className="font-bold mb-2">Environment Variables Test</h2>
      <p>Check the browser console for environment variable values.</p>
      <p className="mt-2 text-sm">
        VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set'}
      </p>
      <p className="text-sm">
        VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
      </p>
    </div>
  );
};

export default EnvTest;
