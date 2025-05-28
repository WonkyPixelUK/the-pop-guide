import { useEffect, useState } from 'react';

const AuthSuccess = () => {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCode(params.get('code'));
  }, []);

  return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">eBay Authentication Successful</h1>
      <p className="mb-4">Thank you for connecting your eBay account.</p>
      {code && (
        <div className="bg-gray-800 text-white rounded p-4 mt-4">
          <div className="font-mono text-sm">Auth Code:</div>
          <div className="break-all font-mono text-xs">{code}</div>
        </div>
      )}
    </div>
  );
};

export default AuthSuccess; 