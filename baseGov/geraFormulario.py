import pandas as pd

# Ler o Excel (mude o caminho para o seu arquivo)
df = pd.read_excel('metadados.xlsx')

# Começa o HTML com Bootstrap Accordion
html = """
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<div class="accordion" id="metaAccordion">
"""

# Agrupa por secção
sections = df.groupby('Secção')

for i, (section_name, group) in enumerate(sections, start=1):
    # Accordion item header
    html += f'''
  <div class="accordion-item">
    <h2 class="accordion-header" id="heading{i}">
      <button class="accordion-button {'collapsed' if i != 1 else ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse{i}" aria-expanded="{'true' if i == 1 else 'false'}" aria-controls="collapse{i}">
        {section_name}
      </button>
    </h2>
    <div id="collapse{i}" class="accordion-collapse collapse {'show' if i == 1 else ''}" aria-labelledby="heading{i}" data-bs-parent="#metaAccordion">
      <div class="accordion-body">
    '''

    # Para cada campo na secção
    for _, row in group.iterrows():
        label = row['Campo']
        input_type = str(row['Tipo']).lower()
        options = str(row.get('Opções', '')).split(',') if pd.notna(row.get('Opções', None)) else []

        # Criar input conforme o tipo
        if input_type == 'select' and options:
            html += f'<div class="mb-3"><label class="form-label">{label}</label><select class="form-select" name="{label.lower().replace(" ","_")}">'
            for option in options:
                html += f'<option value="{option.strip()}">{option.strip()}</option>'
            html += '</select></div>'
        else:
            # Inputs normais
            if input_type not in ['text', 'number', 'email', 'tel', 'date']:
                input_type = 'text'  # fallback
            html += f'<div class="mb-3"><label class="form-label">{label}</label><input type="{input_type}" class="form-control" name="{label.lower().replace(" ","_")}"></div>'

    html += '''
      </div>
    </div>
  </div>
'''

html += '</div>'

# Salva em arquivo HTML
with open('formulario_metadados.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Formulário HTML gerado: formulario_metadados.html")
