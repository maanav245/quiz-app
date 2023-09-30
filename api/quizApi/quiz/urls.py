from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegistrationAPIView.as_view(), name="register"),
    path("login/", views.LoginAPIView.as_view(), name="login"),
    path("logout/", views.LogoutAPIView.as_view(), name="logout"),
    path("lessons/", views.LessonListView.as_view(), name="lessons"),
    path("create-lessons/", views.CreateLessonFromJSON.as_view(), name="createLessons"),
    path("submit-lesson/", views.SubmitAnswersView.as_view(), name="createLessons"),
    path("user-stats/", views.UserQuizStatsView.as_view(), name="userStats"),
    path("user-rankings/", views.UserQuizRankingsView.as_view(), name="userRanks"),
]
