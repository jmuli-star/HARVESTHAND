from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'fields': ('email', 'password1', 'password2', 'role', 'is_staff', 'is_superuser'),
        }),
    )

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'category', 'status', 'published_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('title', 'author__email')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'article', 'user', 'created_at')
    search_fields = ('user__email', 'article__title')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'article', 'user', 'created_at')
    search_fields = ('user__email', 'article__title')
    
admin.site.register(FarmHand)

admin.site.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'location']

admin.site.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['crop_name', 'id', 'farm', 'harvest_date', 'qr_generated']
    readonly_fields = ['id']

admin.site.register(TreatmentLog)
class TreatmentLogAdmin(admin.ModelAdmin):
    list_display = ['batch', 'action_type', 'date', 'product_used']
    
    
admin.site.register(new_farmhand)