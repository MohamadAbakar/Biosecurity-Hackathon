import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Module-level singleton — survives re-renders and doesn't need a Provider
let _user = null;
let _listeners = new Set();

const notify = () => _listeners.forEach(fn => fn(_user));

export const useAuth = () => {
  const [user, setUser] = useState(_user);
  const [loading, setLoading] = useState(!_user && !!localStorage.getItem('token'));

  useEffect(() => {
    const update = (u) => setUser(u);
    _listeners.add(update);

    if (!_user && localStorage.getItem('token')) {
      api.get('/auth/me')
        .then(res => {
          _user = res.data?.data || res.data?.user || res.data;
          if (_user) localStorage.setItem('user', JSON.stringify(_user));
          notify();
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => { _listeners.delete(update); };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data;
    localStorage.setItem('token', data.token);
    _user = data.user;
    localStorage.setItem('user', JSON.stringify(_user));
    notify();
    return _user;
  }, []);

  const register = useCallback(async (username, email, password, extra = {}) => {
    const res = await api.post('/auth/register', { username, email, password, ...extra });
    const data = res.data;
    localStorage.setItem('token', data.token);
    _user = data.user;
    localStorage.setItem('user', JSON.stringify(_user));
    notify();
    return _user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    _user = null;
    notify();
  }, []);

  return { user, loading, login, register, logout };
};
