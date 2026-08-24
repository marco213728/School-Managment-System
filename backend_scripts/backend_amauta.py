# =====================================================================
# MODELOS DE BASE DE DATOS (Django ORM)
# =====================================================================
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class Colaborador(models.Model):
    class RolSector(models.TextChoices):
        DOCENTE = 'docente', 'Docente de Aula'
        DIRECTIVO = 'directivo', 'Directivo Institucional'
        ADMINISTRATIVO = 'administrativo', 'Personal Administrativo (PAS)'
        MEDICO = 'medico', 'Personal de Salud / Médico'
        PSICOLOGO = 'psicologo', 'Psicólogo / Analista DECE'
        APOYO = 'apoyo', 'Personal de Servicios y Apoyo'

    class NivelEducacion(models.TextChoices):
        TERCER_NIVEL = 'tercer_nivel', 'Tercer Nivel (Licenciatura/Ingeniería)'
        CUARTO_NIVEL = 'cuarto_nivel', 'Cuarto Nivel (Maestría/Especialidad)'
        PHD = 'phd', 'Doctorado (PhD)'

    class TipoContrato(models.TextChoices):
        CONTRATO = 'contrato', 'Contrato de Servicios Ocasionales'
        NOMB_DEF = 'definitivo', 'Nombramiento Definitivo'
        NOMB_PROV = 'provisional', 'Nombramiento Provisional'

    nombre = models.CharField(max_length=150)
    cedula = models.CharField(max_length=10, unique=True)
    rol_institucional = models.CharField(max_length=20, choices=RolSector.choices, default=RolSector.DOCENTE)
    nivel_educacion = models.CharField(max_length=20, choices=NivelEducacion.choices)
    titulo_profesional = models.CharField(max_length=150)
    especialidad_accion_personal = models.CharField(max_length=100)
    especialidad_requerida_aula = models.CharField(max_length=100)
    tipo_contrato = models.CharField(max_length=20, choices=TipoContrato.choices)

    en_periodo_lactancia = models.BooleanField(default=False)
    tiene_limitacion_movilidad = models.BooleanField(default=False)
    permiso_cuidado_familiar = models.BooleanField(default=False)

    horas_clase_directa = models.PositiveIntegerField(default=0)
    horas_tutoria_acompanamiento = models.PositiveIntegerField(default=0)
    horas_atencion_padres = models.PositiveIntegerField(default=0)
    horas_maximas_permitidas = models.PositiveIntegerField(default=25)

    def clean(self):
        if len(self.cedula) != 10:
            raise ValidationError({'cedula': 'La cédula debe contener exactamente 10 dígitos.'})
        
        coeficientes = [5, 6]
        suma = 0
        provincia = int(self.cedula[0:2])
        if provincia < 1 or provincia > 24:
            raise ValidationError({'cedula': 'Código de provincia de cédula inválido.'})
        
        for i in range(9):
            valor = int(self.cedula[i]) * coeficientes[i] if i < len(coeficientes) else int(self.cedula[i])
            suma += valor if valor < 10 else valor - 9
            
        verificador = (10 - (suma % 10)) % 10
        if verificador != int(self.cedula[7]):
            raise ValidationError({'cedula': 'Número de cédula inválido matemática o estructuralmente.'})

        if self.en_periodo_lactancia:
            self.horas_maximas_permitidas = 20
            if self.horas_clase_directa > 20:
                raise ValidationError({'horas_clase_directa': 'Docente en lactancia no puede dictar más de 20 horas de clase.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class AulaAccesibilidad(models.Model):
    nombre = models.CharField(max_length=100)
    capacidad_asientos = models.PositiveIntegerField()
    piso = models.PositiveIntegerField(default=1)
    tiene_ascensor = models.BooleanField(default=False)
    tiene_rampa_acceso = models.BooleanField(default=False)
    grado_exclusivo = models.CharField(max_length=50, null=True, blank=True)

    def es_accesible(self):
        if self.piso > 1:
            return self.tiene_ascensor
        return True

class EvaluacionDesempeno(models.Model):
    colaborador = models.ForeignKey(Colaborador, on_delete=models.CASCADE, related_name='evaluaciones')
    periodo_lectivo = models.CharField(max_length=9)
    contribucion_meta_academica = models.TextField(help_text="Metas acordadas con verbos de acción y condiciones de calidad")
    puntaje_competencias_funcionales = models.DecimalField(
        max_digits=5, decimal_places=2, validators=[MinValueValidator(0.0), MaxValueValidator(70.0)]
    )
    puntaje_competencias_comportamentales = models.DecimalField(
        max_digits=5, decimal_places=2, validators=[MinValueValidator(0.0), MaxValueValidator(30.0)]
    )
    ruta_carpeta_evidencias_digital = models.URLField(max_length=500, null=True, blank=True)
    comentarios_retroalimentacion = models.TextField(null=True, blank=True)

    @property
    def calificacion_final(self):
        return self.puntaje_competencias_funcionales + self.puntaje_competencias_comportamentales

class EvaluarAsignacionView(APIView):
    def post(self, request):
        docente_id = request.data.get('colaborador_id')
        aula_id = request.data.get('aula_id')
        grado_paralelo = request.data.get('grado_paralelo')

        try:
            docente = Colaborador.objects.get(id=docente_id)
            aula = AulaAccesibilidad.objects.get(id=aula_id)
        except (Colaborador.DoesNotExist, AulaAccesibilidad.DoesNotExist):
            return Response({"error": "Recurso no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if docente.tiene_limitacion_movilidad and aula.piso > 1 and not aula.tiene_ascensor:
            return Response({
                "valido": False,
                "tipo": "hard",
                "mensaje": f"¡BLOQUEO! El/La docente {docente.nombre} tiene movilidad limitada y el aula {aula.nombre} está en el Piso {aula.piso} sin ascensor."
            }, status=status.HTTP_200_OK)

        if aula.grado_exclusivo and aula.grado_exclusivo != grado_paralelo:
            return Response({
                "valido": False,
                "tipo": "hard",
                "mensaje": f"¡BLOQUEO DE MOBILIARIO! El aula {aula.nombre} tiene mueblería reservada exclusivamente para {aula.grado_exclusivo} y no puede usarse con {grado_paralelo}."
            }, status=status.HTTP_200_OK)

        if docente.en_periodo_lactancia and (docente.horas_clase_directa >= 20):
            return Response({
                "valido": True,
                "tipo": "warning",
                "mensaje": f"Advertencia GETH (Lactancia): El docente {docente.nombre} alcanzará su límite sugerido de 20h de clase directa semanales."
            }, status=status.HTTP_200_OK)

        return Response({"valido": True, "tipo": "ok", "mensaje": "Asignación óptima y sin conflictos."}, status=status.HTTP_200_OK)
