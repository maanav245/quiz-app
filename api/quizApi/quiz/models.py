from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


class Lesson(models.Model):
    title = models.CharField(max_length=255)


class Question(models.Model):
    lesson = models.ForeignKey(
        Lesson, related_name="questions", on_delete=models.CASCADE
    )
    is_multiple = models.BooleanField(default=True)
    text = models.TextField()


class Choice(models.Model):
    question = models.ForeignKey(
        Question, related_name="choices", on_delete=models.CASCADE
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)


class User(AbstractUser):
    pass


class QuizResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    date = models.DateTimeField(default=timezone.now)
    score = models.FloatField()


@receiver([post_save, post_delete], sender=Choice)
def update_is_multiple(sender, instance, **kwargs):
    # Get the associated Question for the Choice
    question = instance.question

    # Check if there are multiple choices with is_correct=True
    is_multiple = question.choices.filter(is_correct=True).count() > 1

    # Update the is_multiple field of the Question
    if question.is_multiple != is_multiple:
        question.is_multiple = is_multiple
        question.save()
