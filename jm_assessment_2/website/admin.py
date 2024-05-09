from django.contrib import admin
from .models import Program, Course, Question, Answer, QuestionPaper

# Register your models here.

admin.site.register(Program)
admin.site.register(Course)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(QuestionPaper)