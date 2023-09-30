# serializers.py

from rest_framework import serializers
from .models import Lesson, Question, Choice, User, QuizResult

from rest_framework import serializers
from .models import Lesson, Question, Choice


class ChoiceSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    text = serializers.CharField(max_length=255, required=True)
    is_correct = serializers.BooleanField(required=True)


class QuestionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    text = serializers.CharField(max_length=255, required=True)
    choices = ChoiceSerializer(many=True, required=True)
    is_multiple = serializers.BooleanField(default=False, required=False)


class LessonSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=255, required=True)
    questions = QuestionSerializer(many=True, required=True)

    def create(self, validated_data):
        # Extract and create lesson
        title = validated_data.get("title")
        questions_data = validated_data.get("questions")

        lesson = Lesson.objects.create(title=title)

        # Create questions and choices
        for question_data in questions_data:
            question_text = question_data.get("text")
            choices_data = question_data.get("choices")

            question = Question.objects.create(
                lesson=lesson, text=question_text, is_multiple=False
            )

            for choice_data in choices_data:
                choice_text = choice_data.get("text")
                is_correct = choice_data.get("is_correct")

                Choice.objects.create(
                    question=question,
                    text=choice_text,
                    is_correct=is_correct,
                )

        return lesson


class SubmitAnswersSerializer(serializers.Serializer):
    lesson_id = serializers.IntegerField()
    answers = serializers.DictField()


class QuizResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizResult
        fields = ("id", "user", "lesson", "score")
