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

// Interceptor to handle unauthenticated 401 response and format API error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gharsetu_token');
      localStorage.removeItem('gharsetu_user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    
    // Normalize custom error payloads
    const serverError = error.response?.data?.error || error.response?.data?.message || error.message;
    if (typeof serverError === 'object' && serverError !== null) {
      error.apiErrorCode = serverError.code;
      error.apiErrorMessage = serverError.message;
      error.message = serverError.message || error.message;
    } else if (typeof serverError === 'string') {
      error.apiErrorMessage = serverError;
      error.message = serverError;
    }

    return Promise.reject(error);
  }
);

// ==========================================
// 1. IDENTITY & AUTHENTICATION HOOKS (S-03, S-10, S-23)
// ==========================================
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

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.get('/users/me')
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.patch('/users/me', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    }
  });
};

export const useSubmitVerificationDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post('/verification/documents', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
    }
  });
};

export const useUploadVerificationDocs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => apiClient.post('/verification/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
    }
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
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

export const useRejectVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }) => apiClient.post(`/admin/verifications/${userId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get('/users/admin')
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }) => apiClient.patch(`/users/admin/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }) => apiClient.patch(`/users/admin/${userId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

// ==========================================
// 2. FINANCE SERVICE HOOKS (S-07)
// ==========================================
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

// ==========================================
// 3. PROPERTY & LISTING HOOKS (S-01, S-02, S-12, S-13, S-19)
// ==========================================
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
    queryFn: () => apiClient.get(`/properties/${propertyId}`),
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftData) => apiClient.post('/properties/draft', draftData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['builder-analytics'] });
    }
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.post(`/properties/${id}/submit`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
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

export const useUpdatePropertyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => apiClient.patch(`/properties/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['builder-analytics'] });
    }
  });
};

export const useAdminListingsQueue = () => {
  return useQuery({
    queryKey: ['moderation-queue'],
    queryFn: () => apiClient.get('/properties/moderation/queue')
  });
};

export const useApproveProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.post(`/properties/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });
};

export const useRejectProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, rejectionReason, rejectionNote }) =>
      apiClient.post(`/properties/${id}/reject`, {
        rejectionReason: rejectionReason || reason || 'Listing rejected by admin',
        rejectionNote: rejectionNote || ''
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });
};

export const useAdminVerifyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status, comments }) =>
      apiClient.post(`/verification/admin/verify`, { userId, status, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-verification'] });
    }
  });
};

// ==========================================
// 4. PREFERENCES, WISHLIST & COMPARISON (S-05, S-06)
// ==========================================
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
      const existing = Array.isArray(items) && items.find(i => (i.propertyId || i.id || i.property?.id) === propertyId);
      if (existing) {
        return removeFromWishlist.mutateAsync(propertyId);
      } else {
        return addToWishlist.mutateAsync({ propertyId, notes });
      }
    },
    mutate: (propertyId, notes = '') => {
      const items = wishlistData?.data || wishlistData || [];
      const existing = Array.isArray(items) && items.find(i => (i.propertyId || i.id || i.property?.id) === propertyId);
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

// ==========================================
// 5. DISCOVERY & SEARCH INTELLIGENCE (S-08)
// ==========================================
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

// ==========================================
// 6. ENGAGEMENT, BOOKINGS & LEADS (S-04, S-14, S-15, S-22)
// ==========================================
export const usePropertyAvailability = (propertyId) => {
  return useQuery({
    queryKey: ['property-availability', propertyId],
    queryFn: () => apiClient.get(`/availability/${propertyId}`),
    enabled: !!propertyId
  });
};

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotData) => apiClient.post('/availability', slotData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-availability', variables.propertyId] });
    }
  });
};

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
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }) => apiClient.post(`/bookings/${bookingId}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
};

export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, newSlotId, newDate }) => apiClient.post(`/bookings/${bookingId}/reschedule`, { newSlotId, newDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
};

export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: () => apiClient.get('/leads')
  });
};

export const useUpdateLeadStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, stage, notes }) => apiClient.patch(`/leads/${leadId}/stage`, { stage, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications')
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, bookingId, rating, comment }) =>
      apiClient.post(`/properties/${propertyId}/reviews`, { bookingId, rating, comment }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.propertyId] });
    }
  });
};

export const useReplyToReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reply, replyText }) =>
      apiClient.post(`/reviews/${reviewId}/reply`, { replyText: replyText || reply }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property'] });
    }
  });
};

export const useModerateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, status, moderationReason }) =>
      apiClient.patch(`/reviews/${reviewId}/moderate`, { status, moderationReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
    }
  });
};

// ==========================================
// 7. ANALYTICS HOOKS (S-11, S-16, S-17, S-21)
// ==========================================
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
