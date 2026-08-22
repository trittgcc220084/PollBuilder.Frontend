import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';

// State lưu Token toàn cục
const token = ref(localStorage.getItem('token') || localStorage.getItem('accessToken') || null);

export function useAuth() {
  // Tự động giải mã token để lấy thông tin user (id, email)
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
    window.location.href = '/login'; // Chuyển về trang login
  };

  return { token, user, login, logout };
}
