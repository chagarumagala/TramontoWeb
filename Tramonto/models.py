from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db.models import Prefetch
from django.conf import settings
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        if 'cnpj' in extra_fields and extra_fields['cnpj'] == '':
            extra_fields['cnpj'] = None
        if 'phone' in extra_fields and extra_fields['phone'] == '':
            extra_fields['phone'] = None
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        return self.create_user(email, password, **extra_fields)

class Users(AbstractBaseUser,PermissionsMixin):
    cnpj = models.BigIntegerField(null=True, blank=True)
    company_name = models.CharField(max_length=45, null=True, blank=True)
    email = models.EmailField(max_length=45,default="aaa")
    phone = models.BigIntegerField(null=True, blank=True)
    name = models.CharField(max_length=45, unique=True, default="user")
    is_active = models.BooleanField(default=True)  # Required for authentication
    is_superuser = models.BooleanField(default=False)  # Required for superuser privileges
    is_staff = models.BooleanField(default=False)  # Required for admin access
    is_client = models.BooleanField(default=False)  # Custom field to indicate if the user is a client
    objects = UserManager()

    USERNAME_FIELD = 'name' 
    REQUIRED_FIELDS = ['email'] 
    def __str__(self):
        return(f"ID:{self.id},name:{self.name}")

class Checklist(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(Users,on_delete=models.CASCADE,related_name='created_checklists')
    clone = models.BooleanField(default=False)
    def __str__(self):
        return self.name
    
class ChecklistItem(models.Model):
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, related_name='items',null=True)
    name = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    order_index = models.IntegerField(default=0)  # Add order_index for sorting


class Tests(models.Model):
    initial_date = models.DateField(null=True, blank=True)
    final_date = models.DateField(null=True, blank=True)
    title = models.CharField(max_length=100,default="test")
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Reference the custom Users model
        on_delete=models.CASCADE,  # Delete the test if the creator is deleted
        related_name='created_tests'  # Allows reverse lookup (e.g., user.created_tests)
    )
    description = models.CharField(null=True, blank=True)
    #black,white and grey-box
    knowledge = models.CharField(max_length=10,default="black-box")
    #low,medium and high
    aggressivity = models.CharField(max_length=10,default="medium")
    #covert and overt
    approach = models.CharField(max_length=10,default="covert")
    #internal and external
    starting_point = models.CharField(max_length=10,default="external")
    #network,web,physical,social,wireless
    vector = models.CharField(max_length=40,default="network")
    completed = models.BooleanField(default=False)
    testers=models.ManyToManyField(
        Users
    )


    checklist = models.ForeignKey(Checklist, on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self):
        return(f"ID:{self.id},name:{self.title}")

    
class Tools(models.Model):
    name = models.CharField(max_length=50,default="tool")
    description = models.CharField(null=True, blank=True)
    link = models.CharField(null=True, blank=True)
    creator = models.ForeignKey(
        Users,
        on_delete=models.CASCADE
    )
    def __str__(self):
        return(f"ID:{self.id},name:{self.name}")
    
class Vulnerabilities(models.Model):
    vuln=models.CharField(max_length=100,default="vuln")
    description = models.TextField(null=True, blank=True)
    expected_results = models.TextField(null=True, blank=True)

    actual_results = models.TextField(null=True, blank=True)

    success = models.BooleanField(default=True)
    code = models.CharField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    vector = models.CharField(max_length=50,default="N/A")
    attack_vector = models.CharField(max_length=20,default="N")
    attack_complexity = models.CharField(max_length=20,default="L")
    privileges_required = models.CharField(max_length=20,default="N")
    user_interaction = models.CharField(max_length=20,default="N")
    scope = models.CharField(max_length=20,default="U")
    confidentiality = models.CharField(max_length=20,default="L")
    integrity = models.CharField(max_length=20,default="L")
    availability = models.CharField(max_length=20,default="L")
    recommendation = models.TextField(null=True, blank=True)
    test = models.ForeignKey(
        Tests,
        on_delete=models.CASCADE,
        related_name='vulnerabilities'
    )
    author = models.CharField(max_length=50,default="N/A")
    tools = models.ManyToManyField(
        Tools
    )

class ConversationManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().prefetch_related(
            Prefetch('participants', queryset=Users.objects.only('id', 'name'))
        )


class Conversation(models.Model):
    participants = models.ManyToManyField(Users, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    objects = ConversationManager()


    def __str__(self):
        participant_names = " ,".join([user.username for user in self.participants.all()])
        return f'Conversation with {participant_names}'


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Users, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f'Message from {self.sender.username} in {self.content[:20]}'
    
class ChatMessage(models.Model):
    test_id = models.IntegerField()
    sender = models.ForeignKey(Users, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.message[:30]}"