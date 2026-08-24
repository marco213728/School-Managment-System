# =================================================================================
# AMAUTA HRIS MODELS (Django ORM)
# =================================================================================
# Implementación de los modelos y lógica activa de Recursos Humanos en Django.

from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()

# ==================== LÓGICA ACTIVA DE VALIDACIÓN ====================
def validar_cedula_ecuatoriana(cedula):
    """
    Validador matemático (Módulo 10) para cédulas ecuatorianas.
    Bloquea registros inválidos directamente a nivel de modelo.
    """
    if not cedula.isdigit() or len(cedula) != 10:
        raise ValidationError('La cédula debe contener exactamente 10 dígitos numéricos.')
    
    provincia = int(cedula[0:2])
    if provincia < 1 or provincia > 24:
        raise ValidationError('El código de provincia es inválido.')

    digito_verificador = int(cedula[9])
    suma = 0
    for i in range(9):
        digito = int(cedula[i])
        if i % 2 == 0:
            digito = digito * 2
            if digito > 9:
                digito -= 9
        suma += digito

    decena_superior = (suma + 9) // 10 * 10
    calculado = decena_superior - suma
    if calculado == 10:
        calculado = 0

    if calculado != digito_verificador:
        raise ValidationError('La cédula ecuatoriana no pasó la validación matemática (Módulo 10).')


# ==================== MODELOS MULTI-ROL (NÓMINA) ====================
class HrisColaborador(models.Model):
    REGIMEN_CHOICES = [('LOEI', 'LOEI'), ('LOSEP', 'LOSEP'), ('CODIGO_TRABAJO', 'Código de Trabajo')]
    ROL_CHOICES = [('DOCENTE', 'Docente'), ('DIRECTIVO', 'Directivo'), ('ADMINISTRATIVO', 'Administrativo'), ('SALUD', 'Salud'), ('DECE', 'DECE'), ('APOYO', 'Apoyo')]

    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    cedula = models.CharField(max_length=10, unique=True, validators=[validar_cedula_ecuatoriana])
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES)
    regimen = models.CharField(max_length=20, choices=REGIMEN_CHOICES)
    superior_directo = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    
    # Ruta de la Felicidad / Salud Ocupacional (Bloqueo activo en el Scheduler)
    en_periodo_lactancia = models.BooleanField(default=False)
    limite_horas_clase = models.PositiveIntegerField(default=30)
    tiene_limitacion_movilidad = models.BooleanField(default=False)

    def clean(self):
        super().clean()
        # SALVAGUARDA: Ajuste por Periodo de Maternidad
        if self.en_periodo_lactancia:
            self.limite_horas_clase = min(self.limite_horas_clase, 20)
            
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombres} {self.apellidos} - {self.get_rol_display()}"


# ==================== SELECCIÓN Y KANBAN ====================
class HrisVacante(models.Model):
    titulo = models.CharField(max_length=150)
    departamento = models.CharField(max_length=100)
    regimen_requerido = models.CharField(max_length=20, choices=HrisColaborador.REGIMEN_CHOICES)
    salario_referencial = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=20, default='ABIERTA')
    
    def __str__(self):
        return self.titulo

class HrisCandidato(models.Model):
    FASE_CHOICES = [('APLICADO', 'Aplicado'), ('ENTREVISTA', 'Entrevista'), ('PRUEBA_TECNICA', 'Prueba Técnica'), ('REFERENCIAS', 'Referencias'), ('SELECCIONADO', 'Seleccionado'), ('DESCALIFICADO', 'Descalificado')]
    
    vacante = models.ForeignKey(HrisVacante, on_delete=models.CASCADE, related_name='candidatos')
    cedula = models.CharField(max_length=10, validators=[validar_cedula_ecuatoriana])
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    fase = models.CharField(max_length=20, choices=FASE_CHOICES, default='APLICADO')
    puntaje_evaluacion = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)


# ==================== EVALUACIÓN Y FATIGA (GUÍA 31) ====================
class HrisEvaluacionDesempeno(models.Model):
    colaborador = models.ForeignKey(HrisColaborador, on_delete=models.CASCADE, related_name='evaluaciones')
    evaluador = models.ForeignKey(HrisColaborador, on_delete=models.CASCADE, related_name='evaluaciones_realizadas')
    periodo_lectivo = models.CharField(max_length=20)
    
    # Ponderaciones Oficiales
    puntaje_funcional = models.DecimalField(max_digits=5, decimal_places=2, help_text="Máx 70 pts")
    puntaje_comportamental = models.DecimalField(max_digits=5, decimal_places=2, help_text="Máx 30 pts")
    
    indice_fatiga_burnout = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    @property
    def puntaje_total(self):
        return (self.puntaje_funcional or 0) + (self.puntaje_comportamental or 0)
        
    def clean(self):
        if self.puntaje_funcional > 70: raise ValidationError("El puntaje funcional máximo es 70.")
        if self.puntaje_comportamental > 30: raise ValidationError("El puntaje comportamental máximo es 30.")

class HrisCompromiso(models.Model):
    evaluacion = models.ForeignKey(HrisEvaluacionDesempeno, on_delete=models.CASCADE, related_name='compromisos')
    verbo = models.CharField(max_length=50)
    objeto_especifico = models.CharField(max_length=255)
    condicion_calidad = models.TextField()
    
    def __str__(self):
        return f"{self.verbo} {self.objeto_especifico} {self.condicion_calidad}"
