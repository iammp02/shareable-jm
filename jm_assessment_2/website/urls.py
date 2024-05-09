from django.urls import path
from . import views


urlpatterns = [
    path("", views.dashboard, name="default"),
    path("login/", views.login_user, name="login"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("logout/", views.logout_user, name="logout"),
    path("add_questions/", views.add_questions, name="add_questions"),
    path("view_questions/", views.view_questions, name="view_questions"),
    path("add_qpaper/", views.add_qpaper, name="add_qpaper"),
    path("submit_qpaper/", views.submit_qpaper, name="submit_qpaper"),
    path("view_qpaper/", views.view_qpaper, name="view_qpaper"),
    path('get_detail_modal/<int:question_id>/', views.get_detail_modal, name='get_detail_modal'),
    path('get_detail_qpaper_modal/<int:qpaper_id>/', views.get_detail_qpaper_modal, name='get_detail_qpaper_modal'),
    # path('edit_question/<int:question_id>/', views.edit_question, name='edit_question'),
    # path('edit_qpaper/<int:qpaper_id>/', views.edit_qpaper, name='edit_qpaper'),
]
