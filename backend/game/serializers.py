from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Participant, Domain, SelfRating, Hostel, Action, Round

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
    
class SimpleParticipantSerializer(serializers.ModelSerializer):
    """A simple serializer to list participants for delegation choices."""
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Participant
        fields = ['id', 'username']

class RoundSerializer(serializers.ModelSerializer):
    domain = serializers.StringRelatedField() # Show the domain name instead of its ID
    class Meta:
        model = Round
        fields = ['id', 'round_number', 'domain', 'question_text']

class ActionSerializer(serializers.ModelSerializer):
    participant = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Action
        fields = ['id', 'action_type', 'delegated_to', 'participant']
        read_only_fields = ['id', 'participant']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.round = self.context.get('round')

    def validate(self, data):
        action_type = data.get('action_type')
        delegated_to = data.get('delegated_to')
        participant = self.context['request'].user.participant

        if Action.objects.filter(round=self.round, participant=participant).exists():
            raise serializers.ValidationError("You have already submitted an action for this round.")

        if action_type == Action.ActionType.DELEGATE:
            if not delegated_to:
                raise serializers.ValidationError("A target must be specified when delegating.")
            if delegated_to == participant:
                raise serializers.ValidationError("You cannot delegate to yourself.")
        
        if action_type != Action.ActionType.DELEGATE and delegated_to:
            raise serializers.ValidationError("Cannot specify a delegation target unless the action is 'DELEGATE'.")

        return data