from django.db import models
from django.conf import settings

# --- Logic: Management App for Tasks and Communication ---
class Task(models.Model):
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_tasks'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='received_tasks'
    )
    
    # CRITICAL: Use the string 'app_label.ModelName' 
    # Do NOT import Batch at the top of the file.
    batch = models.ForeignKey(
        'Harvest_yield.Batch', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='tasks'
    )
    
    title = models.CharField(max_length=255) 
    description = models.TextField(blank=True)
    is_complete = models.BooleanField(default=False)
    category = models.CharField(max_length=50, default='General')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 

    def __str__(self):
        return f"{self.title} | Assigned to: {self.assigned_to.email}"

class Report(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_reports'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='received_reports'
    )

    # OMISSION FIX: Storing the role context as a field is better for 
    # historical records (if a user changes roles later).
    target_role = models.CharField(max_length=50, blank=True)

    title = models.CharField(max_length=200, help_text="e.g., User1 - perform planting")
    message = models.TextField()
    is_complete = models.BooleanField(default=False)
    feedback = models.TextField(blank=True, null=True, help_text="Response from the recipient")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # BUG FIX: In Part 1, we set 'username = None'. 
    # If your Report __str__ tries to access self.sender.role, it works, 
    # but ensure the target_role logic is also visible here.
    def __str__(self):
        return f"{self.title} | {self.sender.email} to {self.recipient.email}"

    # WORKFLOW LOGIC: Automatically populate target_role on save
    def save(self, *args, **kwargs):
        if not self.target_role:
            self.target_role = self.recipient.role
        super().save(*args, **kwargs)