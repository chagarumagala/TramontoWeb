from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from .models import Tests, Users,Tools,Checklist,ChecklistItem,Vulnerabilities
from rest_framework.permissions import IsAuthenticated
# Create your views here.
from django.db.models import Subquery, OuterRef,JSONField
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import TestsSerializer
from datetime import datetime
import math
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
            'id', 'title', 'description','initial_date','final_date', 'knowledge', 'aggressivity', 'approach', 'starting_point', 'vector'
        )
        
        # Return the tests as a JSON response
        return JsonResponse(list(tests), safe=False)
        # Create a new test
       
    if request.method == 'POST':
        data = request.data
        test = Tests.objects.create(
            title=data['title'],
            description=data['description'],
            initial_date=datetime.now().date(),
            final_date=data.get('final_date'),
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
            'initial_date': test.initial_date,
            'final_date': test.final_date,
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
            vulnerabilities = test.vulnerabilities.all()

            # Process vulnerabilities and their associated tools in Python
            vulnerabilities_data = []
            for vuln in vulnerabilities:
                tools = Tools.objects.filter(vulnerabilities=vuln).values('id', 'name', 'link')
                vulnerabilities_data.append({
                    'id': vuln.id,
                    'vuln': vuln.vuln,
                    'description': vuln.description,
                    'success': vuln.success,
                    'code': vuln.code,
                    'vector': vuln.vector,
                    'recommendation': vuln.recommendation,
                    'author': vuln.author,
                    'tools': list(tools),  # Convert tools queryset to a list of dictionaries
                })
            #print(vulnerabilities_data)
            checklist_data = None
            if test.checklist:
                checklist_data = {
                    'id': test.checklist.id,
                    'name': test.checklist.name,
                    'description': test.checklist.description,
                    'items': [
                        {
                            'id': item.id,
                            'name': item.name,
                            'completed': item.completed,
                            'order_index': item.order_index,
                        }
                        for item in test.checklist.items.all()  # Assuming related_name='items'
                    ],
                }
            response_data = {
                'id': test.id,
                'title': test.title,
                'initial_date': test.initial_date,
                'final_date': test.final_date,
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
                'checklist': checklist_data,
                'vulnerabilities': vulnerabilities_data  # Include vulnerabilities in the response

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
        checklists = Checklist.objects.filter(creator=request.user, clone=False)
        response_data = []
        for checklist in checklists:
            response_data.append({
                'id': checklist.id,
                'name': checklist.name,
                'description': checklist.description,
                'clone': checklist.clone,
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
            'clone': checklist.clone,
            'items': [
                {
                    'id': item.id,
                    'name': item.name,
                    'completed': item.completed,
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
def clone_checklist(original_checklist):
    """Clone a checklist and all its items"""
    # Create new checklist
    new_checklist = Checklist.objects.create(
        name= original_checklist.name,
        description=original_checklist.description,
        creator=original_checklist.creator,
        clone = True
    )
    
    # Clone all items
    for item in original_checklist.items.all():
        ChecklistItem.objects.create(
            checklist=new_checklist,
            name=item.name,
            completed=False,   
            order_index=item.order_index
        )
    
    return new_checklist
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def relate_checklist_to_test(request, test_id):
    try:
        # Get the test by ID
        test = get_object_or_404(Tests, id=test_id, creator=request.user)

        # Get the checklist ID from the request data
        checklist_id = request.data.get('checklist_id')
        if not checklist_id:
            return JsonResponse({'error': 'Checklist ID is required.'}, status=400)

        # Get the checklist by ID
        checklist = get_object_or_404(Checklist, id=checklist_id, creator=request.user)

        # Relate the checklist to the test
        test.checklist = clone_checklist(checklist)  
        test.save()

        return JsonResponse({
            'message': 'Checklist successfully related to the test.',
            'test_id': test.id,
            'checklist_id': checklist.id,
            'checklist_name': checklist.name
        }, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_checklist_items(request, checklist_id):
    try:
        # Fetch the checklist for the logged-in user
        checklist = Checklist.objects.get(id=checklist_id, creator=request.user)

        # Fetch all items associated with the checklist
        items = checklist.items.all()  # Assuming `related_name='items'` in the ChecklistItem model

        # Serialize the items
        items_data = [
            {
                'id': item.id,
                'name': item.name,
                'completed': item.completed,
                'order_index': item.order_index,
            }
            for item in items
        ]

        return JsonResponse({'items': items_data}, status=200)

    except Checklist.DoesNotExist:
        return JsonResponse({'error': 'Checklist not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_checklist_from_test(request, test_id):
    try:
        test = Tests.objects.get(id=test_id, creator=request.user)
        if not test.checklist:
            return JsonResponse({'error': 'No checklist is associated with this test.'}, status=400)

        # Remove the checklist association
        test.checklist.delte() # Delete the cloned checklist
        test.checklist = None
        test.save()

        return JsonResponse({'message': 'Checklist removed from the test successfully.'}, status=200)
    except Tests.DoesNotExist:
        return JsonResponse({'error': 'Test not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_completion(request, item_id):
    try:
        # Fetch the checklist item for the logged-in user
        item = ChecklistItem.objects.get(id=item_id, checklist__creator=request.user)

        # Toggle the completed status 
        item.completed = not item.completed
        item.save() 
        # Return the updated item data
        return JsonResponse({
            'id': item.id,
            'name': item.name,
            'completed': item.completed,
            'order_index': item.order_index,
        }, status=200)

    except ChecklistItem.DoesNotExist:
        return JsonResponse({'error': 'Checklist item not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
def create_vuln_vector(data):
    vector_parts = []
    vector_parts.append(f"CVSS:{calculate_score(data)}")
    if 'attack_vector' in data:
        vector_parts.append(f"AV:{data['attack_vector']}")
    if 'attack_complexity' in data:
        vector_parts.append(f"AC:{data['attack_complexity']}")
    if 'privileges_required' in data:
        vector_parts.append(f"PR:{data['privileges_required']}")
    if 'user_interaction' in data:
        vector_parts.append(f"UI:{data['user_interaction']}")
    if 'scope' in data:
        vector_parts.append(f"S:{data['scope']}")
    if 'confidentiality' in data:
        vector_parts.append(f"C:{data['confidentiality']}")
    if 'integrity' in data:
        vector_parts.append(f"I:{data['integrity']}")
    if 'availability' in data:
        vector_parts.append(f"A:{data['availability']}")
    
    return '/'.join(vector_parts)
def calculate_score(data):
    if(data.get('success')==False):
        return -1
    match data['attack_vector']:
        case 'N':
            av = 0.85
        case 'A':
            av = 0.62
        case 'L':
            av = 0.55
        case 'P':
            av = 0.2 
    match data['attack_complexity']:
        case 'L':
            ac = 0.77
        case 'H':
            ac = 0.44 
    match data['privileges_required']:
        case 'N':
            pr = 0.85
        case 'L':
            if data['scope']=='U':
                pr = 0.62
            else:
                pr = 0.68
        case 'H':
            if data['scope']=='U':
                pr = 0.27 
            else:
                pr = 0.5
    match data['user_interaction']:
        case 'N':
            ui = 0.85
        case 'R':
            ui = 0.62 
    match data['confidentiality']:
        case 'H':
            c = 0.56
        case 'L':
            c = 0.22
        case 'N':
            c = 0 
    match data['integrity']:
        case 'H':
            i = 0.56
        case 'L':
            i = 0.22
        case 'N':
            i = 0 
    match data['availability']:
        case 'H':
            a = 0.56
        case 'L':
            a = 0.22
        case 'N':
            a = 0 
    ISS = 1 - ((1 - c) * (1 - i) * (1 - a))
    if data['scope']=='U':
        impact = 6.42 * ISS
    else:
        impact = 7.52 * (ISS - 0.029) - 3.25 * ((ISS - 0.02) ** 15)
    exploitability = 8.22 * av * ac * pr * ui
    if impact <= 0:
        return 0
    else:
        if data['scope']=='U':
            return math.ceil(min((impact + exploitability), 10)*10)/10
        else:
            return math.ceil(min(1.08 * (impact + exploitability), 10)*10)/10

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_vulnerability(request,test_id):
    try: 
        data = request.data
        test = Tests.objects.get(id=test_id)


        # Ensure the user is authorized to add vulnerabilities to this test
        if request.user not in test.testers.all():
            return JsonResponse({'error': 'You are not authorized to add vulnerabilities to this test.'}, status=403)

        vulnerability = Vulnerabilities.objects.create(
            vuln=data['vuln'],
            description=data['description'],
            success=data.get('success', True),
            score=calculate_score(data),
            vector=create_vuln_vector(data),
            code=data.get('code'),
            attack_vector=data.get('attack_vector'),
            attack_complexity=data.get('attack_complexity'),
            privileges_required=data.get('privileges_required'),
            user_interaction=data.get('user_interaction'),
            scope=data.get('scope'),
            confidentiality=data.get('confidentiality'),
            integrity=data.get('integrity'),
            availability=data.get('availability'),
            recommendation=data.get('recommendation'),
            test=test,
            author=request.user.name
            
        )
        tool_ids = data.get('tools', [])
        print(tool_ids)
        tools = Tools.objects.filter(id__in=tool_ids)
        vulnerability.tools.set(tools)
        print(vulnerability.tools.all())
        return JsonResponse({
            'id': vulnerability.id,
            'vuln': vulnerability.vuln,
            'description': vulnerability.description, 
            'test_id': test.id,
        }, status=201)
    except Tests.DoesNotExist:
        return JsonResponse({'error': 'Test not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_vulnerability(request, vuln_id):
    try:
        # Get the vulnerability by ID
        vulnerability = Vulnerabilities.objects.get(id=vuln_id)

        # Ensure the user is authorized to delete the vulnerability
        if request.user.name != vulnerability.author:
            return JsonResponse({'error': 'You are not authorized to delete this vulnerability.'}, status=403)

        # Delete the vulnerability
        vulnerability.delete()

        return JsonResponse({'message': 'Vulnerability deleted successfully.'}, status=200)
    except Vulnerabilities.DoesNotExist:
        return JsonResponse({'error': 'Vulnerability not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_vulnerability(request, vuln_id,test_id):
    try:
        # Get the vulnerability by ID
        vulnerability = Vulnerabilities.objects.get(id=vuln_id)

        # Ensure the user is authorized to edit the vulnerability
        if request.user.name != vulnerability.author:
            return JsonResponse({'error': 'You are not authorized to edit this vulnerability.'}, status=403)
        
        # Update the vulnerability fields
        data = request.data
        vulnerability.vuln = data.get('vuln', vulnerability.vuln)
        vulnerability.description = data.get('description', vulnerability.description)
        vulnerability.vector = create_vuln_vector(data)
        vulnerability.success = data.get('success', vulnerability.success)
        vulnerability.code = data.get('code', vulnerability.code)
        vulnerability.recommendation = data.get('recommendation', vulnerability.recommendation)
        vulnerability.attack_vector=data.get('attack_vector'),
        vulnerability.attack_complexity=data.get('attack_complexity'),
        vulnerability.privileges_required=data.get('privileges_required'),
        vulnerability.user_interaction=data.get('user_interaction'),
        vulnerability.scope=data.get('scope'),
        vulnerability.confidentiality=data.get('confidentiality'),
        vulnerability.integrity=data.get('integrity'),
        vulnerability.availability=data.get('availability'),
        tool_ids = data.get('tools', [])
        if tool_ids:
            tools = Tools.objects.filter(id__in=tool_ids)
            vulnerability.tools.set(tools)  # Update the many-to-many relationship

        
        vulnerability.save()

        return JsonResponse({
            'id': vulnerability.id,
            'vuln': vulnerability.vuln,
            'description': vulnerability.description,
            'vector': vulnerability.vector,
            'recommendation': vulnerability.recommendation,
        }, status=200)
    except Vulnerabilities.DoesNotExist:
        return JsonResponse({'error': 'Vulnerability not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_vulnerability(request, vuln_id):
    try:
        # Get the vulnerability by ID
        vulnerability = Vulnerabilities.objects.get(id=vuln_id) 
        # Ensure the user is authorized to view the vulnerability
        if request.user not in vulnerability.test.testers.all():
            return JsonResponse({'error': 'You are not authorized to view this vulnerability.'}, status=403)

        # Return the vulnerability details
        return JsonResponse({
            'id': vulnerability.id,
            'vuln': vulnerability.vuln,
            'description': vulnerability.description,
            'success': vulnerability.success,
            'code': vulnerability.code,
            'vector': vulnerability.vector,
            'score': vulnerability.score,
            'attack_vector': vulnerability.attack_vector,
            'attack_complexity': vulnerability.attack_complexity,
            'privileges_required': vulnerability.privileges_required,
            'user_interaction': vulnerability.user_interaction,
            'scope': vulnerability.scope,
            'confidentiality': vulnerability.confidentiality,
            'integrity': vulnerability.integrity,
            'availability': vulnerability.availability,
            'recommendation': vulnerability.recommendation,
            'author': vulnerability.author,
            'test_id': vulnerability.test.id,
        }, status=200)
    except Vulnerabilities.DoesNotExist:
        return JsonResponse({'error': 'Vulnerability not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)