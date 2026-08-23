import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';


const token = ref(localStorage.getItem('token') || localStorage.getItem('accessToken') || null);

export function useAuth() {
// Automatically decode the token to retrieve user information (id, email)
  const user = computed(() => {
    if (!token.value) return null;
    try {
      return jwtDecode(token.value);
    } catch (e) {
      return null;
    }
  });

  const login = (newToken) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    token.value = null;
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirect to login page
  };

  return { token, user, login, logout };
}
