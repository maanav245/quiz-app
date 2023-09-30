from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token
from django.db.models import Avg, Max, Min, Sum, F, Window
from django.db.models.functions import Rank
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Lesson, Question, Choice, User, QuizResult
import json
from django.http import JsonResponse
from .serializers import (
    LessonSerializer,
    SubmitAnswersSerializer,
)


class LoginAPIView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            # Generate a token for the user
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                data={"message": "Login successful", "token": token.key},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                data={"message": "Login failed"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class RegistrationAPIView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")

        # Check if the username is already taken
        if User.objects.filter(username=username).exists():
            return Response(
                data={"message": "Username is already taken"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a new user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
        )

        # Generate a token for the user
        token, created = Token.objects.get_or_create(user=user)

        # Authenticate the user and log them in
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response(
                data={
                    "message": "User registered and logged in successfully",
                    "token": token.key,
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                data={"message": "User registration failed"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LogoutAPIView(APIView):
    permission_classes = []

    def post(self, request):
        # Log the user out
        logout(request)
        return Response(
            data={"message": "User logged out successfully"}, status=status.HTTP_200_OK
        )


class LessonListView(generics.ListAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]


class CreateLessonFromJSON(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = json.loads(request.body)

            # Serialize and validate the data
            serializer = LessonSerializer(data=data)

            if serializer.is_valid():
                # Create the lesson and related objects
                lesson = serializer.save()

                return Response(
                    {"message": "Lesson created successfully."},
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SubmitAnswersView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = SubmitAnswersSerializer(data=request.data)

        if serializer.is_valid():
            lesson_id = request.data.get("lesson_id")
            lesson = Lesson.objects.get(pk=lesson_id)
            submitted_answers = request.data.get("answers", [])

            # Retrieve all questions for the lesson
            questions = Question.objects.filter(lesson=lesson)
            question_ids = [str(question.id) for question in questions]

            # Ensure that submitted answers include all question IDs
            if set(submitted_answers.keys()) != set(question_ids):
                return Response(
                    {"error": "Answers must be provided for all questions"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            score = 0

            # Evaluate submitted answers
            for question in questions:
                question_id = str(question.id)
                submitted_choice_ids = submitted_answers.get(question_id, [])
                correct_choices = Choice.objects.filter(
                    question=question, is_correct=True
                ).values_list("id", flat=True)

                # Check if submitted choices match correct choices
                if set(submitted_choice_ids) == set(correct_choices):
                    score += 1

            # Calculate the percentage score
            total_questions = len(questions)
            percentage_score = (score / total_questions) * 100

            # Create a QuizResult instance and save it
            result = QuizResult(
                user=request.user, lesson=lesson, score=percentage_score
            )
            result.save()

            return Response({"score": percentage_score}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserQuizStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_results = QuizResult.objects.filter(user=request.user)

            if not user_results:
                return Response(
                    {"message": "No quiz results found for this user."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Calculate statistics
            highest_score = user_results.aggregate(Max("score"))["score__max"]
            lowest_score = user_results.aggregate(Min("score"))["score__min"]
            average_score = user_results.aggregate(Avg("score"))["score__avg"]
            total_attempts = user_results.count()
            total_score = user_results.aggregate(Sum("score"))["score__sum"]

            # Calculate variance manually
            scores = user_results.values_list("score", flat=True)
            score_variance = self.calculate_variance(scores)

            response_data = {
                "highest_score": highest_score,
                "lowest_score": lowest_score,
                "average_score": average_score,
                "total_attempts": total_attempts,
                "total_score": total_score,
                "score_variance": score_variance,
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {"message": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def calculate_variance(self, values):
        n = len(values)
        if n < 2:
            return None
        mean = sum(values) / n
        variance = sum((x - mean) ** 2 for x in values) / (n - 1)
        return variance


class UserQuizRankingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_rankings = (
                QuizResult.objects.values("user__username")
                .annotate(
                    highest_score=Max("score"),
                    lowest_score=Min("score"),
                    average_score=Avg("score"),
                    total_score=Sum("score"),
                )
                .order_by("-average_score")
                .annotate(
                    rank=Window(expression=Rank(), order_by=F("average_score").desc())
                )
            )

            return Response(
                {"user_rankings": list(user_rankings)}, status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return Response(
                {"message": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )
