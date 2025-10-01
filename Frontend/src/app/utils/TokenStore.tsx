

export const AccessStored = {
    
  getAccessToken: () => localStorage.getItem('accessToken') || '',

  setAccessToken: (token: string) => {
    localStorage.setItem('accessToken', token);
  },

  clear: () => {
    
    localStorage.removeItem('accessToken');
  }

};




export const RefreshStored = {

  getRefreshToken: () => localStorage.getItem('refreshToken') || '',

  setRefreshToken: (token: string) => {

    localStorage.setItem('refreshToken', token);

  },

  clear: () => {

    localStorage.removeItem('refreshToken');

  }

};
