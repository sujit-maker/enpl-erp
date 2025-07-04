
export const loginUser = async (username: string, password: string) => {
    try {
      
      const response = await fetch('http://192.168.29.225:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Invalid credentials';
        throw new Error(errorMessage);
      }
  
      
      const data = await response.json();
      return data;  
    } catch (error) {
      
      throw new Error('Something went wrong during login.');
    }
  };
  