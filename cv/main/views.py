from django.views.generic.base import TemplateView
from django.shortcuts import render


class HomeView(TemplateView):
    template_name = "main/index.html"


class EducationView(TemplateView):
    template_name = "main/education.html"


class ExperienceView(TemplateView):
    template_name = "main/experience.html"


class AchievementsView(TemplateView):
    template_name = "main/achievements.html"


class ContactView(TemplateView):
    template_name = "main/contact.html"
