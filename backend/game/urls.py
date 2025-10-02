from django.urls import path
from .views import (
    RegisterUserView, CustomAuthToken, 
    ParticipantProfileView, DomainListView, 
    SelfRatingCreateListView, HostelListView,
    CurrentRoundView, SubmitActionView
)

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('profile/', ParticipantProfileView.as_view(), name='participant-profile'),
    path('domains/', DomainListView.as_view(), name='domain-list'),
    path('hostels/', HostelListView.as_view(), name='hostel-list'),
    path('self-ratings/', SelfRatingCreateListView.as_view(), name='self-rating-list-create'),
    path('current-round/', CurrentRoundView.as_view(), name='current-round'),
    path('submit-action/', SubmitActionView.as_view(), name='submit-action'),

]