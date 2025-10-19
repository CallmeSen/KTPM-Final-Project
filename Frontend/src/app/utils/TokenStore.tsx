
export const AccessStored = {
    
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || '';
    }
    return '';
  },

  setAccessToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

};




export const RefreshStored = {

  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken') || '';
    }
    return '';
  },

  setRefreshToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
  }

};
