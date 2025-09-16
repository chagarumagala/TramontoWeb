from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from .models import Tests, Users,Tools,Checklist,ChecklistItem
from rest_framework.permissions import IsAuthenticated
# Create your views here.
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import TestsSerializer

@api_view(['GET'])
def index(request):
    # Return a simple JSON response
    return JsonResponse({'message': 'Welcome to Tramonto API!'})
@api_view(['POST'])
def register(request):
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')
    cnpj = request.data.get('cnpj')
    company_name = request.data.get('company_name')
    phone = request.data.get('phone')
    is_client = request.data.get('is_client', False)  # Default to False if not provided

    if not name or not email or not password:
        return JsonResponse({'error': 'name, email, and password are required'}, status=400)

    if Users.objects.filter(name=name).exists():
        return JsonResponse({'error': 'Username already exists'}, status=400)

    user = Users.objects.create_user(name=name, email=email, password=password)
    user.cnpj = cnpj
    user.company_name = company_name
    user.phone = phone
    user.is_client = is_client
    user.save()

    return JsonResponse({'message': 'Account created successfully'}, status=201)

@api_view(['GET', 'PUT']) # Ensure the user is authenticated
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    print(f"Request method: {request.method}")
    print(f"Authenticated user: {user.cnpj}, {user.is_superuser}, {user.email}")
    if request.method == 'GET':
        # Return the user's current information
        return JsonResponse({
            'email': user.email,
            'name': user.name,
            'cnpj': user.cnpj,
            'company_name': user.company_name,
            'phone': user.phone,

        })

    if request.method == 'PUT':
        # Update the user's information
        data = request.data
        user.name = data.get('name', user.name)
        user.email = data.get('email', user.email)
        user.cnpj = data.get('cnpj', user.cnpj)
        user.company_name = data.get('company_name', user.company_name)
        user.phone = data.get('phone', user.phone)
        user.save()
        return JsonResponse({'message': 'Profile updated successfully!'})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def getall_create_test(request):
    user = request.user
    if request.method == 'GET':
        # Get the user by ID 
        id = user.id
        # Get all tests related to the user
        tests = Tests.objects.filter(testers=id).values(
            'id', 'title', 'description', 'knowledge', 'aggressivity', 'approach', 'starting_point', 'vector'
        )
        
        # Return the tests as a JSON response
        return JsonResponse(list(tests), safe=False)
        # Create a new test
    if request.method == 'POST':
        data = request.data
        test = Tests.objects.create(
            title=data['title'],
            description=data['description'],
            knowledge=data['knowledge'],
            aggressivity=data['aggressivity'],
            approach=data['approach'],
            starting_point=data['starting_point'],
            vector=data['vector'],
            completed=data['completed'],
            creator=user # Set the creator to the authenticated user
        )
        test.testers.add(user)  # Add the creator as one of the testers
        return JsonResponse({
            'id': test.id,
            'title': test.title,
            'description': test.description,
            'knowledge': test.knowledge,
            'aggressivity': test.aggressivity,
            'approach': test.approach,
            'starting_point': test.starting_point,
            'vector': test.vector,
            'completed': test.completed,
            'creator': user.name,  # Include the creator's name in the response
            'testers': list(test.testers.values('id', 'name'))  # Include testers in the response
        }, status=201)

@api_view(['GET','PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def view_edit_delete_test(request, pk):
    if request.method == 'GET':# Retrieve a specific test by ID
        try:
            test = Tests.objects.get(pk=pk)
            # Authorization check: Ensure the user is related to the test
            if request.user not in test.testers.all():
                return JsonResponse({'error': 'You are not authorized to view this test'}, status=403)
            response_data = {
                'id': test.id,
                'title': test.title,
                'description': test.description,
                'knowledge': test.knowledge,
                'aggressivity': test.aggressivity,
                'approach': test.approach,
                'starting_point': test.starting_point,
                'vector': test.vector,
                'completed': test.completed,
                'creator': {
                    'id': test.creator.id,
                    'name': test.creator.name,
                },
                'testers': [
                    {'id': tester.id, 'name': tester.name} for tester in test.testers.all()
                ],
                'user_id': request.user.id,
                'is_client': request.user.is_client,
            }
            return JsonResponse(response_data, status=200)
        except Tests.DoesNotExist:
            return JsonResponse({'error': 'Test not found'}, status=404)
    if request.method == 'PUT':
        # Update a specific test by ID
        try:
            test = Tests.objects.get(pk=pk)
            # Authorization check: Ensure the user is the creator
            if test.creator != request.user:
                return JsonResponse({'error': 'You are not authorized to update this test'}, status=403)
            serializer = TestsSerializer(test, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=200)
            return JsonResponse(serializer.errors, status=400)
        except Tests.DoesNotExist:
            return JsonResponse({'error': 'Test not found'}, status=404)

    if request.method == 'DELETE':
            # Delete a specific test by ID
        try:
            test = Tests.objects.get(pk=pk)
            # Authorization check: Ensure the user is the creator
            if test.creator != request.user:
                return JsonResponse({'error': 'You are not authorized to delete this test'}, status=403)
            test.delete()
            return JsonResponse({'message': 'Test deleted successfully'}, status=204)
        except Tests.DoesNotExist:
            return JsonResponse({'error': 'Test not found'}, status=404)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_user_to_test(request, test_id):
    user_to_add_email = request.data.get('email')  # Email of the user to add
    test = get_object_or_404(Tests, id=test_id)

    # Ensure only the creator of the test can add users
    if request.user != test.creator:
        return JsonResponse({'error': 'You are not authorized to add users to this test.'}, status=403)

    # Get the user to add
    user_to_add = get_object_or_404(Users, email=user_to_add_email)

    # Add the user to the test (assuming a ManyToMany relationship)
    test.testers.add(user_to_add)
    test.save()

    return JsonResponse({'message': f'User {user_to_add_email} added to the test successfully.'}, status=200)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tools(request):
    tools = Tools.objects.filter(creator=request.user)
    tools_data = [{'id': tool.id, 'name': tool.name,'description':tool.description,'link':tool.link} for tool in tools]
    return JsonResponse({'tools': tools_data}, status=200)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tool(request):
    tool_name = request.data.get('name')
    print(request.data.get('link'))
    if not tool_name:
        return JsonResponse({'error': 'Tool name is required'}, status=400)
    tool = Tools.objects.create(creator=request.user, name=tool_name,description=request.data.get('description'),link=request.data.get('link'))
    return JsonResponse({'id': tool.id, 'name': tool.name, 'description':tool.description,'link':tool.link}, status=201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_tool(request, tool_id):
    tool = get_object_or_404(Tools, id=tool_id, creator=request.user)
    tool.delete() 
    return JsonResponse({'message': 'Tool deleted successfully'}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_tool(request, tool_id):
    try:
        tool = Tools.objects.get(id=tool_id)  # Ensure the tool belongs to the logged-in user
        response_data = {
            'id': tool.id,
            'name': tool.name,
            'description': tool.description,
            'link': tool.link,
        }
        return JsonResponse(response_data, status=200)
    except Tools.DoesNotExist:
        return JsonResponse({'error': 'Tool not found or you are not authorized to view it.'}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_all_checklists(request):
    try:
        checklists = Checklist.objects.filter(creator=request.user)
        response_data = []
        for checklist in checklists:
            response_data.append({
                'id': checklist.id,
                'name': checklist.name,
                'description': checklist.description,
            })
        return JsonResponse(response_data, safe=False, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checklist(request):
    try:
        name = request.data.get('name')
        description = request.data.get('description', '')
        
        if not name:
            return JsonResponse({'error': 'Name is required'}, status=400)
        
        checklist = Checklist.objects.create(
            name=name,
            description=description,
            creator=request.user
        )
        
        response_data = {
            'id': checklist.id,
            'name': checklist.name,
            'description': checklist.description, 
        }
        return JsonResponse(response_data, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_checklist(request, checklist_id):
    try:
        checklist = Checklist.objects.get(id=checklist_id, creator=request.user)
        items = checklist.items.all()
        
        response_data = {
            'id': checklist.id,
            'name': checklist.name,
            'description': checklist.description,
            'items': [
                {
                    'id': item.id,
                    'name': item.name,
                    'order_index': item.order_index
                }
                for item in items
            ]
        }
        return JsonResponse(response_data, status=200)
    except Checklist.DoesNotExist:
        return JsonResponse({'error': 'Checklist not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_checklist_item(request, checklist_id):
    try:
        checklist = Checklist.objects.get(id=checklist_id, creator=request.user)
        name = request.data.get('name')

        if not name:
            return JsonResponse({'error': 'name is required'}, status=400)
        
        # Get the next order index
        from django.db.models import Max
        max_order = checklist.items.aggregate(Max('order_index'))['order_index__max'] or 0
        
        item = ChecklistItem.objects.create(
            checklist=checklist,
            name=name,
            completed = False,
            order_index=max_order + 1
        )
        print(item)
        response_data = {
            'id': item.id,
            'name': item.name,
            'completed': item.completed,
            'order_index': item.order_index
        }
        return JsonResponse(response_data, status=201)
    except Checklist.DoesNotExist:
        return JsonResponse({'error': 'Checklist not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_checklist_item(request, item_id):
    try:
        print(item_id)
        item = ChecklistItem.objects.get(id=item_id, checklist__creator=request.user)
        item.delete()
        return JsonResponse({'message': 'Item deleted successfully'}, status=200)
    except ChecklistItem.DoesNotExist:
        return JsonResponse({'error': 'Item not found'}, status=404)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_checklist(request, checklist_id):
    try:
        
        checklist = Checklist.objects.get(id=checklist_id, creator=request.user)
        
        checklist.delete()  # This will also delete all related items due to CASCADE
        return JsonResponse({'message': 'Checklist deleted successfully'}, status=200)
        
    except Checklist.DoesNotExist:
        print(f"Checklist with ID {checklist_id} does not exist")
        return JsonResponse({'error': 'Checklist not found'}, status=404)
    except Exception as e:
        print(f"Error deleting checklist: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)
'''def clone_checklist(original_checklist):
    """Clone a checklist and all its items"""
    # Create new checklist
    new_checklist = Checklist.objects.create(
        name=f"{original_checklist.name} (Copy)",
        description=original_checklist.description,
        created_by=original_checklist.created_by
    )
    
    # Clone all items
    for item in original_checklist.items.all():
        ChecklistItem.objects.create(
            checklist=new_checklist,
            title=item.title,
            description=item.description,
            is_completed=False,  # Reset completion status
            order_index=item.order_index
        )
    
    return new_checklist'''