export interface User {
  userId: number;
  email: string;
  name: string;
  role?: string;
}

export const authUtils = {
  // Token'ı localStorage'dan al
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Kullanıcı bilgilerini localStorage'dan al
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  // Token ve kullanıcı bilgilerini kaydet
  setAuth: (token: string, user: User): void => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Token ve kullanıcı bilgilerini temizle
  clearAuth: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Kullanıcı giriş yapmış mı kontrol et
  isAuthenticated: (): boolean => {
    const token = authUtils.getToken();
    return token !== null && token !== '';
  },

  // Token'ın geçerliliğini kontrol et (expire kontrolü)
  isTokenValid: (): boolean => {
    const token = authUtils.getToken();
    if (!token) return false;

    try {
      // JWT token'ı decode et (basit kontrol)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // exp Unix timestamp (saniye -> milisaniye)
      const currentTime = Date.now();

      // Token süresi dolmuş mu?
      if (currentTime >= expirationTime) {
        authUtils.clearAuth();
        return false;
      }

      return true;
    } catch {
      // Token decode edilemezse geçersiz say
      authUtils.clearAuth();
      return false;
    }
  },

  // Token'dan role bilgisini çıkar
  getRoleFromToken: (): string | null => {
    const token = authUtils.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // JWT'de role ClaimTypes.Role olarak saklanıyor
      // Farklı claim type formatlarını kontrol et
      return (
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
        payload.role ||
        null
      );
    } catch {
      return null;
    }
  },

  // Kullanıcının belirli bir role sahip olup olmadığını kontrol et
  hasRole: (role: string): boolean => {
    const userRole = authUtils.getRoleFromToken();
    return userRole === role;
  },

  // Kullanıcının Admin olup olmadığını kontrol et
  isAdmin: (): boolean => {
    return authUtils.hasRole('Admin');
  },

  // Kullanıcının Project Manager olup olmadığını kontrol et
  isProjectManager: (): boolean => {
    return authUtils.hasRole('Project Manager');
  },

  // Kullanıcının Developer olup olmadığını kontrol et
  isDeveloper: (): boolean => {
    return authUtils.hasRole('Developer');
  },
};
