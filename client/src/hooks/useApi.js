import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gharsetu_token') || localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthenticated 401 response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gharsetu_token');
      localStorage.removeItem('gharsetu_user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// --- IDENTITY & AUTH HOOKS ---
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials) => apiClient.post('/auth/login', credentials)
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData) => apiClient.post('/auth/register', userData)
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/auth/verify-otp', payload)
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/auth/resend-otp', payload)
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/auth/forgot-password', payload)
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/auth/reset-password', payload)
  });
};

export const useResetPasswordWithOtp = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/auth/reset-password', payload)
  });
};

export const useSubmitVerificationDoc = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/auth/verification/docs', payload)
  });
};

export const useUploadVerificationDocs = () => {
  return useMutation({
    mutationFn: (formData) => apiClient.post('/auth/verification/docs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  });
};

export const usePendingVerifications = () => {
  return useQuery({
    queryKey: ['pending-verifications'],
    queryFn: () => apiClient.get('/admin/verifications/pending')
  });
};

export const useApproveVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => apiClient.post(`/admin/verifications/${userId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
    }
  });
};

export const useRejectVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }) => apiClient.post(`/admin/verifications/${userId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
    }
  });
};

// --- FINANCE SERVICE HOOKS ---
export const useCalculateEmi = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/finance/emi', payload)
  });
};

export const useCalculateStampDuty = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/finance/stamp-duty', payload)
  });
};

export const useCalculateGst = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/finance/gst', payload)
  });
};

export const useCalculateMaintenance = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/finance/maintenance', payload)
  });
};

export const useCalculateRentAffordability = () => {
  return useMutation({
    mutationFn: (payload) => apiClient.post('/finance/rent-affordability', payload)
  });
};

export const useFinanceRates = () => {
  return useQuery({
    queryKey: ['finance-rates'],
    queryFn: () => apiClient.get('/finance/rates')
  });
};

export const useUpdateFinanceRate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.put('/finance/rates', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-rates'] });
    }
  });
};

// --- PROPERTY / LISTING HOOKS ---
export const useSearchProperties = (filters = {}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => apiClient.get('/search', { params: filters })
  });
};

export const usePropertyAutocomplete = (query) => {
  return useQuery({
    queryKey: ['properties-autocomplete', query],
    queryFn: () => apiClient.get('/search', { params: { query, q: query, title: query } }),
    enabled: !!query && query.length >= 1,
    staleTime: 5000
  });
};

export const usePropertyDetails = (propertyId) => {
  return useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => apiClient.get(`/internal/properties/${propertyId}`),
    enabled: !!propertyId
  });
};

export const useShareMetadata = (propertyId) => {
  return useQuery({
    queryKey: ['share-metadata', propertyId],
    queryFn: () => apiClient.get(`/share/${propertyId}`),
    enabled: !!propertyId
  });
};

export const useCreateDraft = () => {
  return useMutation({
    mutationFn: (draftData) => apiClient.post('/properties/draft', draftData)
  });
};

export const useCheckDuplicateListings = () => {
  return useMutation({
    mutationFn: (data) => apiClient.post('/properties/check-duplicates', data)
  });
};

export const useAutosaveDraft = () => {
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/properties/${id}/autosave`, data)
  });
};

export const useSubmitForReview = () => {
  return useMutation({
    mutationFn: (id) => apiClient.post(`/properties/${id}/submit`)
  });
};

export const useUploadPropertyImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => apiClient.post(`/properties/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    }
  });
};

export const useApproveProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.post(`/properties/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    }
  });
};

export const useRejectProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => apiClient.post(`/properties/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    }
  });
};

// --- PREFERENCE / WISHLIST / COMPARE HOOKS ---
export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiClient.get('/preferences/wishlist')
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, notes }) => apiClient.post('/preferences/wishlist', { propertyId, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId) => apiClient.delete(`/preferences/wishlist/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });
};

export const useToggleWishlist = () => {
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: wishlistData } = useWishlist();

  return {
    mutateAsync: async (propertyId, notes = '') => {
      const items = wishlistData?.data || wishlistData || [];
      const existing = Array.isArray(items) && items.find(i => (i.propertyId || i.id) === propertyId);
      if (existing) {
        return removeFromWishlist.mutateAsync(propertyId);
      } else {
        return addToWishlist.mutateAsync({ propertyId, notes });
      }
    },
    mutate: (propertyId, notes = '') => {
      const items = wishlistData?.data || wishlistData || [];
      const existing = Array.isArray(items) && items.find(i => (i.propertyId || i.id) === propertyId);
      if (existing) {
        removeFromWishlist.mutate(propertyId);
      } else {
        addToWishlist.mutate({ propertyId, notes });
      }
    }
  };
};

export const useCompareProperties = () => {
  return useMutation({
    mutationFn: (propertyIds) => apiClient.post('/preferences/compare', { propertyIds })
  });
};

// --- DISCOVERY & HISTORY HOOKS ---
export const useRecentlyViewed = () => {
  return useQuery({
    queryKey: ['recently-viewed'],
    queryFn: () => apiClient.get('/discovery/recently-viewed')
  });
};

export const useSearchHistory = () => {
  return useQuery({
    queryKey: ['search-history'],
    queryFn: () => apiClient.get('/discovery/search-history')
  });
};

export const useSimilarProperties = (propertyId) => {
  return useQuery({
    queryKey: ['similar-properties', propertyId],
    queryFn: () => apiClient.get(`/discovery/similar/${propertyId}`),
    enabled: !!propertyId
  });
};

// --- ENGAGEMENT / BOOKING / REVIEWS HOOKS ---
export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiClient.get('/bookings/my-bookings')
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingData) => apiClient.post('/bookings', bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
};

export const useSubmitReview = () => {
  return useMutation({
    mutationFn: ({ propertyId, rating, comment }) => apiClient.post(`/properties/${propertyId}/reviews`, { rating, comment })
  });
};

// --- ANALYTICS HOOKS ---
export const useBuilderDashboard = () => {
  return useQuery({
    queryKey: ['builder-analytics'],
    queryFn: () => apiClient.get('/analytics/builder/dashboard')
  });
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiClient.get('/analytics/admin/dashboard')
  });
};
