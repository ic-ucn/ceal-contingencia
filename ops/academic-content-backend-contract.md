# Contrato backend - Apoyo académico CEAL

Este documento deja preparada la capa de datos para convertir la demo de `#material` en persistencia real sin cambiar la interfaz.

## Entidades

### academic_courses
- id
- name
- slug
- aliases
- curriculum_ids
- curriculum_labels
- semester
- area
- prerequisites
- short_description
- coverage_status
- updated_at

### academic_resources
- id
- course_id
- title
- type
- year
- academic_term
- unit
- format
- size_label
- file_url
- preview_url
- source_label
- status
- rating_avg
- download_count
- published_at
- updated_at

### academic_contributions
- id
- course_id
- type
- title
- year
- unit
- format
- submitted_link
- submitted_file_url
- consent_confirmed
- status
- review_note
- created_at
- reviewed_at

### academic_resource_reports
- id
- resource_id
- reason
- detail
- status
- created_at
- resolved_at

### academic_download_events
- id
- resource_id
- created_at
- client_context

### academic_saved_resources
- id
- resource_id
- anonymous_user_id
- created_at

## Estados

Recursos:
- pending
- review
- published
- needs_fix
- archived
- reported

Aportes:
- pending
- review
- needs_fix
- approved
- rejected
- published

Reportes:
- open
- checking
- resolved
- dismissed

## Endpoints previstos

- `GET /api/academic/courses`
- `GET /api/academic/resources`
- `POST /api/academic/contributions`
- `POST /api/academic/resource-reports`
- `POST /api/academic/download-events`
- `POST /api/academic/saved-resources`
- `DELETE /api/academic/saved-resources/:resource_id`

## Reglas

- Ningún aporte se publica automáticamente.
- Todo recurso público debe tener ramo, tipo, año o periodo, fuente y estado.
- Las pruebas anteriores deben aparecer como referencia histórica.
- La gestión interna usa el rol "Docencia CEAL", no validación institucional docente.
- No guardar datos personales si no son necesarios para publicar el recurso.
