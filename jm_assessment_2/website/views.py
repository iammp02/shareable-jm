import json
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import Program, Course, Question, Answer, QuestionPaper
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
# Create your views here.
from django.db.models import Count, Min, Case, When, Value, Q
from django.db.models.functions import TruncDate, TruncWeek, Extract
from datetime import timedelta
import datetime


@login_required
def dashboard(request):
    # For Line Chart
    question_data = Question.objects.annotate(date=TruncDate(
        'created_at')).values('date').annotate(value=Count('id'))

    lc_data = [{'date': item['date'].strftime(
        '%Y-%m-%d'), 'value': item['value']} for item in question_data]
    try:
        max_date = max([datetime.datetime.strptime(
            x['date'], '%Y-%m-%d') for x in lc_data])

        for i in range(1, (7-(len(lc_data))+1)):
            lc_data.append(
                {'date': (max_date + datetime.timedelta(days=i)).strftime('%Y-%m-%d'), 'value': 0})
    except Exception as e:
        pass

    # For Bar Chart
    bar_chart_data = list(Course.objects.annotate(
        total_questions=Count('question'),
        active_questions=Count('question', filter=Q(
            question__status=Question.ACTIVE)),
        inactive_questions=Count('question', filter=Q(
            question__status=Question.INACTIVE))
    ).values('course_name', 'total_questions', 'active_questions', 'inactive_questions').order_by('total_questions'))

    sunburst = {
        'name': 'course',
        'children': []
    }

    for course in Course.objects.all():
        course_dict = {
            'name': course.course_name,
            # 'size': Question.objects.filter(course=course).count(),
            'children': [
                {
                    'name': 'Active',
                    'value': Question.objects.filter(course=course, status=Question.ACTIVE).count(),
                    'children': [
                        {
                            'name': 'Simple',
                            'value': Question.objects.filter(course=course, status=Question.ACTIVE, complexity=Question.SIMPLE).count()
                        },
                        {
                            'name': 'Medium',
                            'value': Question.objects.filter(course=course, status=Question.ACTIVE, complexity=Question.MEDIUM).count()
                        },
                        {
                            'name': 'Complex',
                            'value': Question.objects.filter(course=course, status=Question.ACTIVE, complexity=Question.COMPLEX).count()
                        },
                    ]
                },
                {
                    'name': 'Inactive',
                    'value': Question.objects.filter(course=course, status=Question.INACTIVE).count(),
                    'children': [
                        {
                            'name': 'Simple',
                            'value': Question.objects.filter(course=course, status=Question.INACTIVE, complexity=Question.SIMPLE).count()
                        },
                        {
                            'name': 'Medium',
                            'value': Question.objects.filter(course=course, status=Question.INACTIVE, complexity=Question.MEDIUM).count()
                        },
                        {
                            'name': 'Complex',
                            'value': Question.objects.filter(course=course, status=Question.INACTIVE, complexity=Question.COMPLEX).count()
                        },
                    ]
                },
            ]
        }
        sunburst['children'].append(course_dict)

    metrics = {
        'total_questions': Question.objects.count(),
        'total_qpapers': QuestionPaper.objects.count(),
        'active_questions': Question.objects.filter(status='Active').count(),
        'inactive_questions': Question.objects.filter(status='Inactive').count(),
        'active_qpapers': QuestionPaper.objects.filter(status='Active').count(),
        'inactive_qpapers': QuestionPaper.objects.filter(status='Inactive').count(),
    }
    context = {'metrics': metrics, 'lc_data': json.dumps(lc_data), 'bc_data': json.dumps(
        bar_chart_data), 'sunburst_data': json.dumps(sunburst)}
    return render(request, "dashboard.html", context)


def login_user(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f"Logged in as {username}")
            return render(request, 'dashboard.html')
        else:
            messages.error(request, "Invalid credentials")
            return render(request, 'login.html', {"error_message": "Invalid creds"})
    else:
        return render(request, 'login.html')


@ login_required
def logout_user(request):
    logout(request)
    return render(request, 'login.html', {})


@ csrf_exempt
@ login_required
def add_questions(request):
    if request.method == "POST":
        data = json.loads(request.body)
        program = Program.objects.get(program_name=data['program_name'])
        course = Course.objects.get(course_name=data['course_name'])
        question = Question(
            program=program,
            course=course,
            status=data['status'],
            complexity=data['complexity'],
            question_type=data['question_type'],
            question_text=data['question_text'],
            added_by=request.user
        )
        question.save()

        # Create Answer object
        answer_options = [data['answer'][x] for x in data['answer']]
        answer = Answer(
            question=question,
            no_of_answers=data['no_of_answers'],
            answer_type=data['answer_type'],
            correct_ans=data['correct_ans'],
            # answer_text= answer_options[len(answer_options)- 1]
            answer_text=data['answer_text']
        )
        for i, option in enumerate(answer_options, start=1):
            setattr(answer, f'answer_op_{i}', option)
        answer.save()

        return JsonResponse({'success': True})
    else:
        programs = Program.objects.all()
        courses = Course.objects.all()
        return render(request, 'add_questions.html', {'program_options': programs,
                                                      'course_options': courses,
                                                      'add_questions_url': reverse('add_questions'),
                                                      'csrf_token': request.META.get('CSRF_COOKIE')})


@ login_required
def view_questions(request):
    if request.user.is_authenticated:
        questions = Question.objects.all()

        return render(request, 'view_questions.html', {'questions': questions})


def is_ajax(request):
    return request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'


@ login_required
def add_qpaper(request):
    if request.method == 'GET':
        programs = Program.objects.all()
        courses = Course.objects.all()
        sems = QuestionPaper.sem_list
        return render(request, 'add_question_paper.html', {'program_options': programs, 'course_options': courses, 'sems': sems})
    elif is_ajax(request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'})

        program_ = data.get('program')
        course_ = data.get('course')
        if not program_ or not course_:
            return JsonResponse({'error': 'Missing program or course data'})

        questions = Question.objects.filter(
            program__program_name=program_, course__course_name=course_)
        data = [
            {
                'ID': question.pk,
                'Question': question.question_text,
                'Complexity': question.complexity,
                'Program': question.program.program_name,
                'Course': question.course.course_name,
            }
            for question in questions
        ]
        print(data)
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'})


@ login_required
def submit_qpaper(request):
    if is_ajax(request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Error'})
        program_name = data.get('program')
        course_name = data.get('course')
        program = Program.objects.get(program_name=program_name)
        course = Course.objects.get(course_name=course_name)
        question_paper = QuestionPaper(
            program=program,
            course=course,
            question_paper_name=data.get('qpaper_name'),
            semester=data.get('semester'),
            institute_name=data.get('institute_name'),
            exam_date=data.get('exam_date'),
            marks_for_each=data.get('marks_for_each'),
            q_count=data.get('q_count'),
            total_marks=data.get('total_marks'),
            exam_duration=data.get('exam_duration'),
            added_by=request.user,
            status=data.get('status'),
            question_ids=data.get('question_ids'),
        )
        question_paper.save()
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'})


@ login_required
def view_qpaper(request):
    if request.user.is_authenticated:
        question_papers = QuestionPaper.objects.all()

        return render(request, 'view_question_paper.html', {'question_papers': question_papers})


@ login_required
def get_detail_modal(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    answers = get_object_or_404(Answer, question=question)
    print(answers)
    data = {
        'question_id': question.pk,
        'program_name': question.program.program_name,
        'course_name': question.course.course_name,
        'status': question.status,
        'complexity': question.complexity,
        'question_text': question.question_text,
        'added_by': question.added_by.username,
        'created_at': question.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        'no_of_answers': answers.no_of_answers,
        'answers': [x for x in answers.__str__().split(',') if x != ' None'],
        'correct_ans': answers.correct_ans,
        'correct_ans_text': answers.answer_text
    }
    print(data)
    return JsonResponse(data)


@ login_required
def get_detail_qpaper_modal(request, qpaper_id):
    qpaper = get_object_or_404(QuestionPaper, id=qpaper_id)
    qpaper_data = {
        'qpaper_id': qpaper.pk,
        'program_name': qpaper.program.program_name,
        'course_name': qpaper.course.course_name,
        'question_paper_name': qpaper.question_paper_name,
        'semester': qpaper.semester,
        'institute_name': qpaper.institute_name,
        'exam_date': qpaper.exam_date.strftime("%Y-%m-%d"),
        'exam_duration': qpaper.exam_duration.strftime("%H:%M"),
        'q_count': qpaper.q_count,
        'marks_for_each': qpaper.marks_for_each,
        'total_marks': int(qpaper.total_marks),
        'added_by': qpaper.added_by.username,
        'created_at': qpaper.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        'status': qpaper.status,
    }

    question_ids = [int(x) for x in qpaper.question_ids.removeprefix(
        '[').removesuffix(']').split(',')]
    questions = Question.objects.values(
        'id', 'question_text', 'program__program_name', 'course__course_name', 'status').filter(id__in=question_ids)
    # questions_data = serialize('json', questions)
    print(list(questions))
    data = {'main': qpaper_data, 'questions': list(questions)}
    return JsonResponse(data, safe=False)


# def edit_question(request, question_id):
#     question = get_object_or_404(Question, pk=question_id)
#     answer = get_object_or_404(Answer, question=question)
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         for i in data:
#             if i == 'program_name':
#                 setattr(question, 'program',
#                         Program.objects.get(program_name=data[i]))
#             elif i == 'course_name':
#                 setattr(question, 'course',
#                         Course.objects.get(course_name=data[i]))
#             elif i == 'answer':
#                 for j in range(3,6):
#                     setattr(answer, f'answer_op_{j}', models.SET_DEFAULT)
#                 answer.save()
#                 answer_options = [data['answer'][x] for x in data['answer']]
#                 for i, option in enumerate(answer_options, start=1):
#                     setattr(answer, f'answer_op_{i}', option)
#                 answer.save()
#             elif i in ['status', 'complexity', 'question_type', 'question_text']:
#                 setattr(question, i, data[i])
#             else:
#                 setattr(answer, i, data[i])

#         question.save()
#         answer.save()
#         return JsonResponse({'success': True})
#     else:
#         # Render the template with the question and answer data
#         no_ans = answer.no_of_answers
#         answers = [getattr(answer, f'answer_op_{i+1}') for i in range(no_ans)]
#         context = {
#             'program_name': question.program.program_name,
#             'course_name': question.course.course_name,
#             'status': question.status,
#             'complexity': question.complexity,
#             'question_type': question.question_type,
#             'question_text': question.question_text,
#             'answer_type': answer.answer_type,
#             'no_of_answers': no_ans,
#             'answers': json.dumps(answers),
#             'answer_text': answer.answer_text,
#             'correct_ans': answer.correct_ans,
#             'program_options': Program.objects.all(),
#             'course_options': Course.objects.all(),
#             'edit_question_url': reverse('edit_question', args=[question_id])
#         }

#         return render(request, 'edit_question.html', context)


# def edit_qpaper(request, qpaper_id):
#     sems = QuestionPaper.sem_list
#     qpaper = get_object_or_404(QuestionPaper, pk=qpaper_id)
#     questions = Question.objects.filter(program__program_name=qpaper.program.program_name, course__course_name=qpaper.course.course_name)
#     q_data = [
#             {
#                 'ID': question.pk,
#                 'Question': question.question_text,
#                 'Complexity': question.complexity,
#                 'Program': question.program.program_name,
#                 'Course': question.course.course_name,
#             }
#             for question in questions
#         ]
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         print(data)
#         return JsonResponse({'success': True})
#     else:
#         context = {
#             'question_paper_name': qpaper.question_paper_name,
#             'program_name': qpaper.program.program_name,
#             'course_name': qpaper.course.course_name,
#             'semester': qpaper.semester,
#             'institute_name': qpaper.institute_name,
#             'exam_date': qpaper.exam_date.strftime('%Y-%m-%d'),
#             'exam_duration': qpaper.exam_duration.strftime('%H:%M'),
#             'status': qpaper.status,
#             'marks_for_each': qpaper.marks_for_each,
#             'program_options': Program.objects.all(),
#             'course_options': Course.objects.all(),
#             'sems' : sems,
#             'questions' : q_data
#         }

#         return render(request, 'edit_qpaper.html', context)
