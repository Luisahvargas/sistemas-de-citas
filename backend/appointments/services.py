from django.core.exceptions import ValidationError
from .models import Appointment


# Transiciones de estado permitidas
ALLOWED_TRANSITIONS = {
    Appointment.Status.PROGRAMADA: [Appointment.Status.EN_PROCESO, Appointment.Status.CANCELADA],
    Appointment.Status.EN_PROCESO: [Appointment.Status.ENTREGADA, Appointment.Status.CANCELADA],
    Appointment.Status.ENTREGADA:  [],
    Appointment.Status.CANCELADA:  [],
}


def validate_status_transition(current_status: str, new_status: str) -> None:
    """Valida que el cambio de estado sea permitido."""
    if current_status == new_status:
        return

    allowed = ALLOWED_TRANSITIONS.get(current_status, [])

    if new_status not in allowed:
        raise ValidationError(
            f"No se puede cambiar el estado de '{current_status}' a '{new_status}'."
        )


def create_appointment(data: dict, user) -> Appointment:
    """Crea una nueva cita."""
    appointment = Appointment(**data, created_by=user)
    appointment.full_clean()
    appointment.save()
    return appointment


def update_appointment(appointment: Appointment, data: dict) -> Appointment:
    """Actualiza una cita validando la transición de estado."""
    new_status = data.get('status', appointment.status)
    validate_status_transition(appointment.status, new_status)

    for field, value in data.items():
        setattr(appointment, field, value)

    appointment.full_clean()
    appointment.save()
    return appointment
