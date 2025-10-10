from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('',views.index),
    path('tests/', views.getall_create_test, name='get_user_tests'),
    path('tests/create/', views.getall_create_test, name='create_test'),
    path('tests/<int:pk>/', views.view_edit_delete_test, name='get_test'),  # Retrieve a specific test
    path('tests/<int:pk>/update/', views.view_edit_delete_test, name='update_test'),  # Update a specific test
    path('tests/<int:pk>/delete/', views.view_edit_delete_test, name='delete_test'),  # Delete a specific test
    path('tests/<int:test_id>/remove-checklist/', views.remove_checklist_from_test, name='remove_checklist_from_test'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', views.register, name='register'),
    path('editprofile/', views.user_profile, name='edit_profile'),
    path('viewprofile/', views.user_profile, name='view_profile'),
    path('tests/<int:test_id>/add-user/', views.add_user_to_test, name='add_user_to_test'), 
    path('tools/', views.get_tools, name='get_tools'), 
    path('tools/<int:tool_id>/delete/', views.delete_tool, name='delete_tool'),
    path('tools/create/', views.create_tool, name='create_tool'),
    path('tools/<int:tool_id>/', views.view_tool, name='get_tool'),  # Retrieve a specific tool
    path('checklists/', views.view_all_checklists, name='view_checklists'),
    path('checklists/create/', views.create_checklist, name='create_checklist'),
    path('checklists/<int:checklist_id>/', views.view_checklist, name='view_checklist'),
    path('checklists/<int:checklist_id>/add-item/', views.add_checklist_item, name='add_item_to_checklist'),
    #path('checklists/<int:checklist_id>/delete/', views.delete_checklist, name='delete_checklist'),
    path('checklists/checklist-items/<int:item_id>/delete/', views.delete_checklist_item, name='delete_checklist_item'),
    path('checklists/<int:checklist_id>/delete/', views.delete_checklist, name='delete_checklist'),
    path('tests/<int:test_id>/relate-checklist/', views.relate_checklist_to_test, name='relate_checklist_to_test'),
    path('checklists/<int:checklist_id>/items/', views.get_checklist_items, name='get_checklist_items'),
    path('checklist-items/<int:item_id>/toggle-completion/', views.toggle_completion, name='toggle_completion'),
    path('tests/<int:test_id>/vulnerabilities/create/', views.create_vulnerability, name='create_vulnerability'),
    path('vulnerabilities/<int:vuln_id>/delete/', views.delete_vulnerability, name='delete_vulnerability'),
    path('tests/<int:test_id>/vulnerabilities/<int:vuln_id>/edit/', views.edit_vulnerability, name='edit_vulnerability'),
    path('vulnerabilities/<int:vuln_id>/', views.fetch_vulnerability, name='fetch_vulnerability'),
    path('tests/<int:test_id>/complete/', views.complete_test, name='complete_test')

]

