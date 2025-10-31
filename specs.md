# HolisticMatch - Marketplace de Terapias Holísticas

## 📋 Visão Geral

Plataforma marketplace onde profissionais de terapias holísticas se cadastram e usuários buscam por tipo de serviço, filtrando por localização, preço e tipo de atendimento. Foco em descoberta e contato direto entre profissional e cliente.

**Status:** MVP  
**Prioridade:** Alto  
**Público:** Profissionais autônomos de terapias holísticas + clientes em busca de serviços

---

## 🏗️ Stack Técnico

| Componente | Tecnologia |
|-----------|-----------|
| Backend | Django 4.2+ REST Framework |
| Frontend | React 18+ Vite + TailwindCSS + Motion (Framer Motion) |
| Banco de Dados | Supabase PostgreSQL |
| Armazenamento | AWS S3 |
| Deploy Backend | AWS App Runner |
| Deploy Frontend | Vercel |
| Autenticação | JWT (dj-rest-auth) |

---

## 👥 User Stories

### 1. Como Profissional, quero me cadastrar na plataforma

**Descrição:**  
Um profissional de terapias holísticas precisa se registrar com seus dados, serviços e formas de contato para aparecer no marketplace.

**Critérios de Aceitação:**

- [ ] Profissional acessa página de cadastro
- [ ] Preenche: Email, Senha, Nome Completo, Foto
- [ ] Seleciona tipos de serviço (checkboxes multi-select)
- [ ] Define preço por sessão (em R$)
- [ ] Seleciona tipo de atendimento (Domicílio / Espaço Próprio / Ambos)
- [ ] Insere Cidade e Bairro
- [ ] Escreve bio de até 500 caracteres
- [ ] Fornece contatos: WhatsApp, Instagram (opcional), Email
- [ ] Clica "Cadastrar" → conta criada, redirecionado para dashboard
- [ ] Recebe email de confirmação
- [ ] Foto é uploadada para S3 com URL pública

**Fluxo Técnico:**
POST /api/auth/register/
├─ Valida email único
├─ Hash senha
├─ Cria user + professional record
├─ Upload foto → S3
└─ Retorna JWT token

text

---

### 2. Como Profissional, quero editar meu perfil

**Descrição:**  
Profissional consegue atualizar informações de seu perfil após cadastro.

**Critérios de Aceitação:**

- [ ] Acessa Dashboard do Profissional (autenticado)
- [ ] Vê form pré-preenchido com dados atuais
- [ ] Edita qualquer campo (foto, serviços, preço, bio, contatos)
- [ ] Clica "Salvar"
- [ ] Perfil atualizado em tempo real
- [ ] Mensagem de sucesso exibida
- [ ] Se mudar foto, upload para S3 e URL atualizada

**Fluxo Técnico:**
PUT /api/professionals/{id}/
├─ Requer autenticação (JWT)
├─ Valida proprietário do recurso
├─ Atualiza fields
├─ Se foto: delete S3 antiga + upload nova
└─ Retorna professional atualizado

text

---

### 3. Como Usuário, quero buscar profissionais por serviço

**Descrição:**  
Usuário acessa homepage e busca profissionais filtrando por tipo de serviço, localização e preço.

**Critérios de Aceitação:**

- [ ] Homepage carrega com formulário de busca visível
- [ ] Dropdown "Tipo de Serviço" mostra: Reiki, Acupuntura, Aromaterapia, Massagem, Meditação Guiada, Tai Chi, Reflexologia
- [ ] Campo "Cidade" com autocomplete
- [ ] Slider "Preço Máximo" (R$ 50 - R$ 500)
- [ ] Checkbox "Precisa ser em domicílio?"
- [ ] Usuário preenche critérios → clica "Buscar"
- [ ] Lista de profissionais carrega com animação stagger (Motion)
- [ ] Mostra máx 12 cards por página
- [ ] Paginação simples (Anterior/Próximo)

**Fluxo Técnico:**
GET /api/professionals/?service=reiki&city=São Paulo&max_price=150&needs_home=true
├─ Filtra Active=true
├─ Filtra por serviço (JSON contains)
├─ Filtra por cidade (case-insensitive)
├─ Filtra preço <= max_price
├─ Filtra attendance_type
└─ Retorna lista com pagination

text

---

### 4. Como Usuário, quero ver detalhes de um profissional

**Descrição:**  
Usuário clica em um card e abre modal/página com detalhes completos + botões de contato.

**Critérios de Aceitação:**

- [ ] Clica no card do profissional
- [ ] Modal/página abre com animação (scale + fade)
- [ ] Exibe: Foto grande, Nome, Bio, Todos os serviços, Preço, Localização
- [ ] Mostra ícones de tipo atendimento (casa, escritório, ambos)
- [ ] Botões de contato:
  - [ ] "Chamar no WhatsApp" (abre WhatsApp com link `wa.me/{numero}`)
  - [ ] "Enviar Email" (abre cliente de email)
  - [ ] "Copiar Instagram" (se preenchido)
- [ ] Botão "Voltar" ou X para fechar

**Fluxo Técnico:**
GET /api/professionals/{id}/
├─ Retorna dados completos
└─ Frontend renderiza modal com Motion

text

---

### 5. Como Usuário, quero ver animações suaves na interface

**Descrição:**  
Interface possui transições e animações com Motion que melhoram a experiência.

**Critérios de Aceitação:**

- [ ] Cards aparecem com fade-in + slide-up ao carregar (stagger 0.1s entre cards)
- [ ] Hover em card faz scale 1.03 + sombra aumenta
- [ ] Modal abre com scale 0.8→1.0 + opacity fade
- [ ] Botões têm whileHover (scale 1.05) e whileTap (scale 0.95)
- [ ] Badge "Match Score" aparece com scale animation
- [ ] Transições suaves entre páginas (sem saltos)

**Fluxo Técnico:**
Motion Setup:
├─ Container variants com staggerChildren: 0.1
├─ Item variants para slide-up
├─ AnimatePresence para exit animations
└─ whileHover/whileTap em botões

text

---

## 🗄️ Models (Database Schema)

### Professional

class Professional(models.Model):
# Relations
user = OneToOneField(User, on_delete=CASCADE) # Django Auth

text
# Perfil
full_name = CharField(max_length=200)
photo_url = URLField()  # S3 URL
bio = TextField(max_length=500)

# Serviços (JSON array)
services = JSONField(default=list)  # ["reiki", "acupuntura"]

# Preço
price_per_session = DecimalField(max_digits=6, decimal_places=2)  # 150.00

# Atendimento
attendance_type = CharField(
    max_length=10,
    choices=[('home', 'Domicílio'), ('office', 'Espaço Próprio'), ('both', 'Ambos')],
    default='office'
)

# Localização
city = CharField(max_length=100)
neighborhood = CharField(max_length=100)

# Contatos
whatsapp = CharField(max_length=20)  # +55 format: +5511999999999
instagram = CharField(max_length=100, blank=True, null=True)
email = EmailField()

# Status
is_active = BooleanField(default=True)
created_at = DateTimeField(auto_now_add=True)
updated_at = DateTimeField(auto_now=True)

class Meta:
    indexes = [
        Index(fields=['city', 'is_active']),
        Index(fields=['price_per_session']),
    ]

def __str__(self):
    return self.full_name
text

### Services Constant

SERVICES = [
'Reiki',
'Acupuntura',
'Aromaterapia',
'Massagem Relaxante',
'Massagem Terapêutica',
'Meditação Guiada',
'Tai Chi',
'Reflexologia',
'Cristaloterapia',
'Florais',
'Yoga',
'Pilates Holístico'
]

text

---

## 🔌 API Endpoints

### Authentication

POST /api/auth/register/
Body: {
"email": "maria@email.com",
"password": "secure123",
"full_name": "Maria Silva",
"whatsapp": "+5511999999999",
"city": "São Paulo",
"neighborhood": "Pinheiros",
"bio": "Terapeuta com 10 anos experiência",
"services": ["Reiki", "Cristaloterapia"],
"price_per_session": 150.00,
"attendance_type": "both",
"photo": <File>
}
Response: {
"user_id": 123,
"professional_id": 456,
"access_token": "jwt...",
"refresh_token": "jwt..."
}

POST /api/auth/login/
Body: {
"email": "maria@email.com",
"password": "secure123"
}
Response: {
"access_token": "jwt...",
"refresh_token": "jwt...",
"user": { "id": 123, "email": "maria@email.com" }
}

POST /api/auth/logout/
Headers: { "Authorization": "Bearer {token}" }
Response: { "detail": "Logged out successfully" }

text

### Professionals CRUD

GET /api/professionals/
Query Params:
?service=Reiki
&city=São Paulo
&max_price=200
&needs_home=true
&page=1
&limit=12

Response: {
"count": 45,
"next": "/api/professionals/?page=2",
"previous": null,
"results": [
{
"id": 1,
"full_name": "Maria Silva",
"photo_url": "https://s3.../photo.jpg",
"bio": "...",
"services": ["Reiki", "Cristaloterapia"],
"price_per_session": 150.00,
"attendance_type": "both",
"city": "São Paulo",
"neighborhood": "Pinheiros",
"whatsapp": "+5511999999999",
"instagram": "maria.terapia",
"email": "maria@email.com"
},
...
]
}

GET /api/professionals/{id}/
Response: { /* professional completo */ }

POST /api/professionals/ (Requer auth)
Headers: { "Authorization": "Bearer {token}" }
Body: {
"full_name": "Maria Silva",
"services": ["Reiki"],
"price_per_session": 150.00,
"attendance_type": "both",
"city": "São Paulo",
"neighborhood": "Pinheiros",
"bio": "...",
"whatsapp": "+5511999999999",
"instagram": "",
"email": "maria@email.com",
"photo": <File>
}
Response: { "id": 456, ... }

PUT /api/professionals/{id}/ (Requer auth + proprietário)
Headers: { "Authorization": "Bearer {token}" }
Body: { /* qualquer campo / }
Response: { / professional atualizado */ }

GET /api/services/
Response: {
"services": [
"Reiki",
"Acupuntura",
...
]
}

text

---

## 🎨 Frontend Components

### Estrutura

src/
├── pages/
│ ├── HomePage.jsx
│ ├── ProfessionalDetail.jsx
│ ├── RegisterPage.jsx
│ ├── LoginPage.jsx
│ └── DashboardPage.jsx
├── components/
│ ├── SearchFilters.jsx
│ ├── ProfessionalCard.jsx
│ ├── ProfessionalModal.jsx
│ ├── ContactButtons.jsx
│ ├── Form/
│ │ ├── ProfessionalForm.jsx
│ │ ├── AuthForm.jsx
│ ├── Navigation.jsx
│ └── LoadingSpinner.jsx
├── services/
│ ├── api.js (Axios instance)
│ ├── authService.js
│ └── professionalService.js
├── hooks/
│ ├── useAuth.js
│ ├── useProfessionals.js
│ └── useForm.js
└── App.jsx

text

### HomePage Component

**Critério de Aceitação:**

- [ ] Componente carrega com SearchFilters visível
- [ ] Usuário preenche filtros → clica "Buscar"
- [ ] Chamada GET /api/professionals/ com query params
- [ ] Cards renderizam com Motion stagger
- [ ] Clique em card abre ProfessionalModal
- [ ] Paginação funciona (next/previous)

**Props:** `None` (useState interno)

**State:**
{
filters: { service: '', city: '', maxPrice: 500, needsHome: false },
professionals: [],
loading: false,
error: null,
selectedProfessional: null,
page: 1
}

text

---

### SearchFilters Component

**Critério de Aceitação:**

- [ ] Dropdown "Tipo de Serviço" com lista dinâmica
- [ ] Input "Cidade" com autocomplete (fetch /api/cities/)
- [ ] Slider "Preço Máximo" (50-500)
- [ ] Checkbox "Precisa ser em domicílio?"
- [ ] Botão "Buscar" dispara callback onSearch()
- [ ] Botão "Limpar" reseta filters para default

**Props:**
{
onSearch: (filters) => void,
isLoading: boolean
}

text

---

### ProfessionalCard Component

**Critério de Aceitação:**

- [ ] Exibe foto, nome, serviços, preço, localização
- [ ] Hover faz scale 1.03 com Motion
- [ ] Clique abre modal com detalhes
- [ ] Animação inicial: fade-in + slide-up

**Props:**
{
professional: {
id: number,
full_name: string,
photo_url: string,
services: string[],
price_per_session: number,
city: string,
neighborhood: string,
attendance_type: string
},
onSelect: (professional) => void
}

text

---

### ProfessionalModal Component

**Critério de Aceitação:**

- [ ] Abre com AnimatePresence (scale + fade)
- [ ] Exibe foto grande, nome, bio, serviços
- [ ] Ícones para attendance_type
- [ ] Botões: WhatsApp, Email, Instagram (se existir)
- [ ] Botão X ou "Voltar" fecha modal
- [ ] Background dark semi-transparent
- [ ] Clique fora fecha modal

**Props:**
{
isOpen: boolean,
professional: Professional,
onClose: () => void
}

text

---

### DashboardPage Component

**Critério de Aceitação:**

- [ ] Apenas profissionais autenticados acessam
- [ ] Exibe form pré-preenchido com dados atuais
- [ ] Permite editar todos os campos
- [ ] Upload de foto (novo ou manter atual)
- [ ] Botão "Salvar" → PUT /api/professionals/{id}/
- [ ] Mensagem de sucesso/erro
- [ ] Logout button

**Props:** `None` (usa useAuth + params)

---

## 🚀 Deploy

### Backend - AWS App Runner

**Dockerfile:**

FROM python:3.11-slim

WORKDIR /app

System dependencies
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

Copy code
COPY . .

Migrations
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

Run
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]

text

**Environment Variables (.env):**

DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=api.holisticmatch.com,localhost
DATABASE_URL=postgresql://user:password@supabase-host:5432/postgres
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=holisticmatch-storage
AWS_S3_REGION_NAME=us-east-1
CORS_ALLOWED_ORIGINS=https://holisticmatch.com,http://localhost:3000

text

**Steps:**

1. Conectar GitHub repo no AWS App Runner
2. Fazer push → auto-deploy
3. Configurar variáveis de ambiente no console

### Frontend - Vercel

**vercel.json:**

{
"buildCommand": "npm run build",
"outputDirectory": "dist",
"env": {
"VITE_API_URL": "@api_url"
}
}

text

**Steps:**

1. Conectar repo no Vercel
2. Fazer push → auto-deploy
3. Configurar `VITE_API_URL` apontando para backend

---

## 📦 Dependencies

### Backend (requirements.txt)

Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
dj-rest-auth==5.0.2
djangorestframework-simplejwt==5.3.2
python-decouple==3.8
psycopg2-binary==2.9.9
boto3==1.34.0
pillow==10.1.0
gunicorn==21.2.0

text

### Frontend (package.json)

{
"dependencies": {
"react": "^18.2.0",
"react-dom": "^18.2.0",
"react-router-dom": "^6.20.0",
"axios": "^1.6.0",
"framer-motion": "^10.16.0",
"tailwindcss": "^3.4.0"
},
"devDependencies": {
"vite": "^5.0.0",
"@vitejs/plugin-react": "^4.2.0"
}
}

text

---

## ✅ Checklist de Aceitação (Fase MVP)

### Backend

- [ ] Modelos criados (Professional)
- [ ] Migrações rodadas em Supabase
- [ ] Endpoints de auth funcionando (register/login/logout)
- [ ] CRUD Professional funcionando
- [ ] Filtros de busca implementados
- [ ] Upload de foto para S3
- [ ] Autenticação JWT validando
- [ ] CORS configurado corretamente
- [ ] Testes em Postman/Insomnia OK

### Frontend

- [ ] HomePage com SearchFilters funcionando
- [ ] Listagem de profissionais renderizando
- [ ] ProfessionalCard com Motion animações
- [ ] ProfessionalModal abrindo/fechando
- [ ] Botões de contato (WhatsApp/Email) funcionando
- [ ] Form de cadastro validando
- [ ] Form de login funcionando
- [ ] DashboardPage editando perfil
- [ ] Animações suaves com Motion
- [ ] Responsivo em mobile (Tailwind)

### Deploy

- [ ] Backend em App Runner rodando
- [ ] Frontend em Vercel rodando
- [ ] Variáveis de ambiente configuradas
- [ ] URLs de API corretas
- [ ] CORS permitindo requisições
- [ ] S3 fazendo upload de fotos
- [ ] Supabase PostgreSQL conectando
- [ ] Teste end-to-end: cadastro → busca → contato OK

---

## 📝 Notas de Implementação

### S3 Upload (Backend)

settings.py
USE_S3 = os.getenv('USE_S3') == 'True'

if USE_S3:
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = 'us-east-1'
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

models.py - photo_url gerada automaticamente
class Professional(models.Model):
photo = ImageField(upload_to='professionals/', null=True, blank=True)

text
@property
def photo_url(self):
    if self.photo:
        return self.photo.url
    return None
text

### Motion Stagger (Frontend)

// HomePage.jsx
const containerVariants = {
hidden: { opacity: 0 },
visible: {
opacity: 1,
transition: {
staggerChildren: 0.1,
delayChildren: 0.1
}
}
};

const itemVariants = {
hidden: { opacity: 0, y: 20 },
visible: {
opacity: 1,
y: 0,
transition: { duration: 0.4 }
}
};

<motion.div
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
variants={containerVariants}
initial="hidden"
animate="visible"

{professionals.map(prof => (
<motion.div key={prof.id} variants={itemVariants}>
<ProfessionalCard professional={prof} />
</motion.div>
))}
</motion.div>

text

---

## 🔄 Fluxo de Desenvolvimento Recomendado

1. **Setup Supabase** → criar banco, connection string
2. **Setup Django** → models, migrations, initial data
3. **Setup React** → estrutura de pastas, setup Vite
4. **Backend APIs** → endpoints funcionando (testar em Postman)
5. **Frontend Pages** → HomePage, RegisterPage, LoginPage
6. **Frontend Components** → SearchFilters, ProfessionalCard, Modal
7. **Motion Animations** → adicionar depois dos layouts prontos
8. **Deploy** → Vercel + App Runner
9. **Polish** → testar, bugs, UX improvements

---

## 📞 Contato de Suporte

- Documentação Django: https://docs.djangoproject.com
- Documentação React: https://react.dev
- Motion Docs: https://motion.dev
- Spec-Kit Guide: https://github.com/github/spec-kit