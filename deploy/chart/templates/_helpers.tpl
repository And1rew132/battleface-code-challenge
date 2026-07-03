{{- define "battleface.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "battleface.namespace" -}}
{{- default .Release.Namespace .Values.namespace.name -}}
{{- end -}}

{{- define "battleface.labels" -}}
app: {{ include "battleface.name" . }}
app.kubernetes.io/name: {{ include "battleface.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end -}}

{{- define "battleface.imagePullSecrets" -}}
{{- with .Values.imagePullSecrets }}
imagePullSecrets:
{{- toYaml . | nindent 2 }}
{{- end }}
{{- end -}}

{{- define "battleface.backendSecretName" -}}
{{- default (printf "%s-secrets" (include "battleface.name" .)) .Values.backend.existingSecret -}}
{{- end -}}

{{- define "battleface.postgresSecretName" -}}
{{- default .Values.postgres.secretName .Values.postgres.existingSecret -}}
{{- end -}}
