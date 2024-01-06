from django.urls import path
from . import views

app_name = "main"
urlpatterns = [
    path("", views.HomeView.as_view(), name="index"),
    path("education", views.EducationView.as_view(), name="education"),
    path("experience", views.ExperienceView.as_view(), name="experience"),
    path("achievements", views.AchievementsView.as_view(),
         name="achievements"),
    path("contact", views.ContactView.as_view(), name="contact"),
]
