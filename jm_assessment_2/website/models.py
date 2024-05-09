from django.db import models
# from django.core.validators import FileExtensionValidator
# from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
# from PIL import Image

class Program(models.Model):
    BSC = "B.Sc."
    BE = "BE"
    BTECH = "B.Tech"
    BCA = "BCA"
    MSC = "M.Sc."
    ME = "ME"
    MTECH = "M.Tech"
    MCA = "MCA"
    choices_program_dict = {
        BSC: "Bachelor of Science",
        BE: "Bachelor of Engineering",
        BTECH: "Bachelor of Technology",
        BCA: "Bachelor of Computer Applications",
        MSC: "Master of Science",
        ME: "Master of Engineering",
        MTECH: "Master of Technology",
        MCA: "Master of Computer Applications"
    }
    program_name = models.CharField(max_length=6, choices=choices_program_dict)

    def __str__(self):
        return (self.program_name)


class Course(models.Model):
    AIML = "AI/ML"
    AWS = "AWS"
    APPDEV = "Android App Development"
    COMMSKILL = "Communication Skill"
    DS = "Data Science"
    DEVOPS = "DevOps"
    DM = "Digital Marketing"
    ENP = "Entrepreneurship"
    FCD = "Frontend Core Development"
    FSJD = "Full Stack Java Development"
    MEAN = "Full Stack MEAN"
    MERN = "Full Stack MERN"
    PHP = "Full Stack PHP Development"
    PY = "Python"
    ST = "Sales Training"
    WEB = "Website Development"
    choices_course_dict = {
        AIML: "AI/ML",
        AWS: "AWS",
        APPDEV: "Android App Development",
        COMMSKILL: "Communication Skill",
        DS: "Data Science",
        DEVOPS: "DevOps",
        DM: "Digital Marketing",
        ENP: "Entrepreneurship",
        FCD: "Frontend Core Development",
        FSJD: "Full Stack Java development",
        MEAN: "Full Stack MEAN",
        MERN: "Full Stack MERN",
        PHP: "Full Stack PHP development",
        PY: "Python",
        ST: "Sales Training",
        WEB: "Website Development",
    }
    course_name = models.CharField(max_length=27, choices=choices_course_dict)
    # program = models.ForeignKey(Program, on_delete=models.PROTECT)

    def __str__(self):
        return (self.course_name)



class Question(models.Model):
    # Status CONSTANTS
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    # Complexity CONSTANTS
    SIMPLE = "Simple"
    MEDIUM = "Medium"
    COMPLEX = "Complex"
    # Question Type CONSTANTS
    NORMAL = "Normal"
    MATH = "Math"
    # IMG = "Image"
    choices_qstatus_dict = {ACTIVE: "Active", INACTIVE: "Inactive"}
    choices_qcomplexity_dict = {SIMPLE: "Simple",
                                MEDIUM: "Medium",
                                COMPLEX: "Complex"}
    # choices_qtype_dict = {NORMAL: "Normal", MATH: "Math", IMG: "Image"}
    choices_qtype_dict = {NORMAL: "Normal", MATH: "Math"}

    program = models.ForeignKey(Program, on_delete=models.PROTECT)
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    status = models.CharField(max_length=9, choices=choices_qstatus_dict)
    complexity = models.CharField(
        max_length=8, choices=choices_qcomplexity_dict)
    question_type = models.CharField(max_length=7, choices=choices_qtype_dict)
    question_text = models.TextField()
    # question_img = models.ImageField(upload_to="questions/", validators=[
    #                                  FileExtensionValidator(allowed_extensions=['jpg', 'png']), ImageValidator], default=None, null=True, blank=True)
    added_by = models.ForeignKey(
        User, on_delete=models.PROTECT, null=True, editable=False)
    # override save method for saving the current user

    def save(self, *args, **kwargs):
        if self.added_by is None:
            user = kwargs.pop('user', None)
            self.added_by = user
        super(Question, self).save(*args, **kwargs)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)

    def __str__(self):
        return self.question_text
        # return f"{self.status}, {self.complexity}, {self.question_type}, {self.question_text}, {self.added_by}, {self.created_at}"


class Answer(models.Model):
    # Answer type CONSTANTS
    NORMAL = "Normal"
    MATH = "Math"
    
    choices_atype_dict = {NORMAL: "Normal", MATH: "Math"}

    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    no_of_answers = models.IntegerField(
        choices=((1, 1), (2, 2), (3, 3), (4, 4), (5, 5)))
    answer_type = models.CharField(max_length=7, choices=choices_atype_dict)
    answer_op_1 = models.CharField(max_length=200)
    answer_op_2 = models.CharField(max_length=200)
    answer_op_3 = models.CharField(max_length=200, blank=True, default='')
    answer_op_4 = models.CharField(max_length=200, blank=True, default='')
    answer_op_5 = models.CharField(max_length=200, blank=True, default='')
    correct_ans = models.CharField(max_length=9)
    answer_text = models.CharField(max_length=500, null = True)

    def __str__(self):
        return f"{self.answer_op_1}, {self.answer_op_2}, {self.answer_op_3}, {self.answer_op_4}, {self.answer_op_5}"


class QuestionPaper(models.Model):
    # Sem Constants
    ONE = "SEM I"
    TWO = "SEM II"
    THREE = "SEM III"
    FOUR = "SEM IV"
    FIVE = "SEM V"
    SIX = "SEM VI"
    SEVEN = "SEM VII"
    EIGHT = "SEM VIII"
    NINE = "SEM IX"
    TEN = "SEM X"
    sem_list = [ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN]
    # Status CONSTANTS
    ACTIVE = "Active"
    INACTIVE = "Inactive"

    choices_sem = {
        ONE: "SEMESTER I",
        TWO: "SEMESTER II",
        THREE: "SEMESTER III",
        FOUR: "SEMESTER IV",
        FIVE: "SEMESTER V",
        SIX: "SEMESTER VI",
        SEVEN: "SEMESTER VII",
        EIGHT: "SEMESTER VIII",
        NINE: "SEMESTER IX",
        TEN: "SEMESTER X",
    }

    choices_qpaper_status_dict = {ACTIVE: "Active", INACTIVE: "Inactive"}
    program = models.ForeignKey(Program, on_delete=models.PROTECT)
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    question_paper_name = models.CharField(max_length=50)
    semester = models.CharField(max_length=9, choices=choices_sem)
    institute_name = models.CharField(max_length=100)
    exam_date = models.DateField()
    marks_for_each = models.IntegerField()
    q_count = models.IntegerField()
    total_marks = models.DecimalField(
        max_digits=3, decimal_places=1, null=True)
    exam_duration = models.TimeField()
    added_by = models.ForeignKey(
        User, on_delete=models.PROTECT, null=True, editable=False)

    # Override save method to fill the added_by field with the current user
    def save(self, *args, **kwargs):
        if self.added_by is None:
            user = kwargs.pop('user', None)
            self.added_by = user
        super(QuestionPaper, self).save(*args, **kwargs)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    status = models.CharField(max_length=9, choices=choices_qpaper_status_dict)
    question_ids = models.TextField()

    def __str__(self):
        return f"{self.pk}, {self.question_paper_name}, {self.created_at}, {self.added_by}, {len(self.question_ids.split(','))}, {self.status}"
