from django.contrib import admin 
from .models import Tools
from .models import Checklist, ChecklistItem,Tools,Tests,Users
# Register your models here.
admin.site.register(Users)
admin.site.register(Tests)
admin.site.register(Tools)
admin.site.register(Checklist)
admin.site.register(ChecklistItem)