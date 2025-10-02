from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Participant, Domain, SelfRating, Hostel

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hostel
        fields = ['id', 'name']

class ParticipantProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    hostel = HostelSerializer(read_only=True)
    
    class Meta:
        model = Participant
        fields = ['id', 'user', 'hostel']

class SelfRatingSerializer(serializers.ModelSerializer):
    participant = serializers.PrimaryKeyRelatedField(queryset=Participant.objects.all())
    domain = serializers.PrimaryKeyRelatedField(queryset=Domain.objects.all())

    class Meta:
        model = SelfRating
        fields = ['id', 'participant', 'domain', 'rating', 'justification']
        read_only_fields = ['id']

    def validate(self, data):
        if SelfRating.objects.filter(
            participant=data['participant'],
            domain=data['domain']
        ).exists():
            raise serializers.ValidationError("Participant has already rated this domain.")
        return data