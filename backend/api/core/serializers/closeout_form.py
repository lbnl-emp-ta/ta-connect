from rest_framework import serializers

from core.models import CloseoutForm


class CloseoutFormSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    
    class Meta:
        model = CloseoutForm
        fields = [
            "id",
            "request",
            "submitted_date",
            "experience_description",
            "ta_provided_description",
            "impact_description",
            "alignment_description",
            "customer_feedback",
            "follow_up_needed",
            "follow_up_description",
            "follow_up_duration",
            "follow_up_comments",
            "follow_up_has_same_expert",
            "questions",
        ]
        read_only_fields = ["id", "request", "submitted_date"]

    def get_questions(self, obj):
        question_fields = [
            "experience_description",
            "ta_provided_description",
            "impact_description",
            "alignment_description",
            "customer_feedback",
            "follow_up_needed",
            "follow_up_description",
            "follow_up_duration",
            "follow_up_comments",
            "follow_up_has_same_expert",
        ]
        return {
            field: CloseoutForm._meta.get_field(field).verbose_name
            for field in question_fields
        }
