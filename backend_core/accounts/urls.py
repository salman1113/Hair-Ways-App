from django.urls import path, include
from .views import (
    RegisterApi, UserProfileApi, 
    EmployeeListCreateApi, EmployeeDetailApi,
    AttendanceListApi, AttendancePunchApi,
    PayrollListApi, GeneratePayrollApi,
    GoogleLoginApi, UserListApi,
    CustomLoginApi, VerifyRegistrationOTPApi, VerifyAdminLoginOTPApi,
    CustomTokenRefreshView,
    MyEmployeeProfileApi, EmployeeReviewsApi, EmployeeNotificationsApi,
    SettlePayoutApi, PayoutHistoryListApi,
    CreateReviewApi
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Auth & User
    path('register/', RegisterApi.as_view(), name='register'),
    path('register/verify/', VerifyRegistrationOTPApi.as_view(), name='register-verify'),
    path('login/', CustomLoginApi.as_view(), name='login'),
    path('login/admin/verify/', VerifyAdminLoginOTPApi.as_view(), name='admin-login-verify'),
    path('login/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('login/google/', GoogleLoginApi.as_view(), name='google-login'),
    path('me/', UserProfileApi.as_view(), name='user-profile'),
    path('users/', UserListApi.as_view(), name='user-list'),
        
    # Employees
    path('employees/', EmployeeListCreateApi.as_view(), name='employee-list'),
    path('employees/me/', MyEmployeeProfileApi.as_view(), name='employee-me'),
    path('employees/<int:pk>/', EmployeeDetailApi.as_view(), name='employee-detail'),
    path('employees/me/reviews/', EmployeeReviewsApi.as_view(), name='employee-reviews'),
    path('employees/me/notifications/', EmployeeNotificationsApi.as_view(), name='employee-notifications'),

    # Reviews
    path('reviews/create/', CreateReviewApi.as_view(), name='create-review'),
    
    # Attendance
    path('attendance/', AttendanceListApi.as_view(), name='attendance-list'),
    path('attendance/punch/', AttendancePunchApi.as_view(), name='attendance-punch'),

    # Payroll
    path('payroll/', PayrollListApi.as_view(), name='payroll-list'),
    path('payroll/generate/', GeneratePayrollApi.as_view(), name='payroll-generate'),

    # Payouts
    path('employees/<int:pk>/settle-payout/', SettlePayoutApi.as_view(), name='settle-payout'),
    path('employees/<int:pk>/payout-history/', PayoutHistoryListApi.as_view(), name='payout-history'),
    path('employees/me/payout-history/', PayoutHistoryListApi.as_view(), name='my-payout-history'),
]