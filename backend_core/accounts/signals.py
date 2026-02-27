from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from .models import EmployeeProfile, CustomerProfile, Review

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'EMPLOYEE':
            EmployeeProfile.objects.get_or_create(user=instance)
        elif instance.role == 'CUSTOMER':
            CustomerProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if instance.role == 'EMPLOYEE' and hasattr(instance, 'employee_profile'):
        instance.employee_profile.save()
    elif instance.role == 'CUSTOMER' and hasattr(instance, 'customer_profile'):
        instance.customer_profile.save()


# ---------------------------------------------------------
# REVIEW SIGNALS: Auto-recalculate Employee Rating
# ---------------------------------------------------------
def _update_employee_rating(employee):
    """Recalculate rating and review_count from all reviews using DB aggregation."""
    stats = employee.reviews.aggregate(
        avg_rating=Avg('rating'),
        total_reviews=Count('id')
    )
    employee.rating = stats['avg_rating'] or 5.0
    employee.review_count = stats['total_reviews'] or 0
    employee.save(update_fields=['rating', 'review_count'])


@receiver(post_save, sender=Review)
def update_rating_on_review_save(sender, instance, **kwargs):
    _update_employee_rating(instance.employee)


@receiver(post_delete, sender=Review)
def update_rating_on_review_delete(sender, instance, **kwargs):
    _update_employee_rating(instance.employee)