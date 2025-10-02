# game/views.py
from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth.models import User

from .models import Participant, Domain, SelfRating, Hostel
from .serializers import UserSerializer, ParticipantProfileSerializer, SelfRatingSerializer, HostelSerializer

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        hostel_id = request.data.get('hostel_id')
        hostel = None
        if hostel_id:
            try:
                hostel = Hostel.objects.get(id=hostel_id)
            except Hostel.DoesNotExist:
                return Response({"hostel_id": "Invalid hostel ID provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        participant = Participant.objects.create(user=user, hostel=hostel)

        token, created = Token.objects.get_or_create(user=user)

        headers = self.get_success_headers(serializer.data)
        return Response({
            'user': serializer.data,
            'participant_id': participant.id,
            'token': token.key
        }, status=status.HTTP_201_CREATED, headers=headers)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username
        })

class ParticipantProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ParticipantProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.participant

    def perform_update(self, serializer):
        hostel_id = self.request.data.get('hostel_id')
        if hostel_id is not None:
            try:
                hostel = Hostel.objects.get(id=hostel_id)
                serializer.instance.hostel = hostel
            except Hostel.DoesNotExist:
                raise serializers.ValidationError({"hostel_id": "Invalid hostel ID provided."})
        serializer.save()

class DomainListView(generics.ListAPIView):
    queryset = Domain.objects.all()
    serializer_class = SelfRatingSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        class SimpleDomainSerializer(serializers.ModelSerializer):
            class Meta:
                model = Domain
                fields = ['id', 'name']
        
        queryset = self.filter_queryset(self.get_queryset())
        serializer = SimpleDomainSerializer(queryset, many=True)
        return Response(serializer.data)

class SelfRatingCreateListView(generics.ListCreateAPIView):
    serializer_class = SelfRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SelfRating.objects.filter(participant=self.request.user.participant)

    def perform_create(self, serializer):
        if not self.request.user.participant:
            raise serializers.ValidationError("User is not associated with a Participant profile.")
        
        if serializer.validated_data['participant'].user != self.request.user:
            raise serializers.ValidationError("You can only submit ratings for your own participant profile.")
            
        serializer.save()

class HostelListView(generics.ListAPIView):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    permission_classes = [AllowAny]