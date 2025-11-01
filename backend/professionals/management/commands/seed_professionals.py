"""
Management command to seed the database with sample professionals
Usage: python manage.py seed_professionals
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from professionals.models import Professional


class Command(BaseCommand):
    help = 'Seeds the database with sample professional profiles'

    def handle(self, *args, **options):
        self.stdout.write("Clearing existing professionals...")
        Professional.objects.all().delete()
        User.objects.filter(username__startswith='professional').delete()

        professionals_data = [
            {
                'username': 'professional1',
                'email': 'maria.silva@email.com',
                'password': 'senha123',
                'name': 'Maria Silva',
                'bio': 'Terapeuta holística com mais de 10 anos de experiência em Reiki e meditação. Especializada em equilíbrio energético e bem-estar emocional. Atendo com muito carinho e dedicação cada cliente.',
                'services': ['Reiki', 'Meditação Guiada', 'Florais'],
                'city': 'São Paulo',
                'state': 'SP',
                'price_per_session': 150.00,
                'attendance_type': 'ambos',
                'whatsapp': '11987654321',
                'phone': '1133334444',
            },
            {
                'username': 'professional2',
                'email': 'joao.santos@email.com',
                'password': 'senha123',
                'name': 'João Santos',
                'bio': 'Acupunturista certificado pela OMS com formação em Medicina Tradicional Chinesa. Tratamento especializado para dores crônicas, ansiedade e estresse. Mais de 15 anos de prática clínica.',
                'services': ['Acupuntura', 'Massagem'],
                'city': 'Rio de Janeiro',
                'state': 'RJ',
                'price_per_session': 200.00,
                'attendance_type': 'presencial',
                'whatsapp': '21987654321',
                'phone': '2133334444',
            },
            {
                'username': 'professional3',
                'email': 'ana.costa@email.com',
                'password': 'senha123',
                'name': 'Ana Costa',
                'bio': 'Instrutora de Yoga certificada com especialização em Hatha e Vinyasa. Aulas personalizadas para todos os níveis. Foco em respiração, flexibilidade e paz interior. Sessões online disponíveis.',
                'services': ['Yoga', 'Meditação Guiada', 'Tai Chi'],
                'city': 'Belo Horizonte',
                'state': 'MG',
                'price_per_session': 120.00,
                'attendance_type': 'online',
                'whatsapp': '31987654321',
                'phone': '3133334444',
            },
            {
                'username': 'professional4',
                'email': 'carlos.oliveira@email.com',
                'password': 'senha123',
                'name': 'Carlos Oliveira',
                'bio': 'Terapeuta em Aromaterapia e Cristaloterapia. Utilizo técnicas ancestrais para harmonização dos chakras e limpeza energética. Atendimento individualizado com óleos essenciais puros.',
                'services': ['Aromaterapia', 'Cristaloterapia', 'Reiki'],
                'city': 'Curitiba',
                'state': 'PR',
                'price_per_session': 180.00,
                'attendance_type': 'presencial',
                'whatsapp': '41987654321',
                'phone': '4133334444',
            },
            {
                'username': 'professional5',
                'email': 'juliana.lima@email.com',
                'password': 'senha123',
                'name': 'Juliana Lima',
                'bio': 'Massoterapeuta especializada em massagem terapêutica e relaxante. Certificação internacional em diversas técnicas. Atendimento domiciliar disponível. Promovo saúde e relaxamento profundo.',
                'services': ['Massagem', 'Reflexologia', 'Aromaterapia'],
                'city': 'Porto Alegre',
                'state': 'RS',
                'price_per_session': 160.00,
                'attendance_type': 'ambos',
                'whatsapp': '51987654321',
                'phone': '5133334444',
            },
            {
                'username': 'professional6',
                'email': 'patricia.mendes@email.com',
                'password': 'senha123',
                'name': 'Patrícia Mendes',
                'bio': 'Terapeuta floral com formação em Florais de Bach e Saint Germain. Atendimento personalizado para questões emocionais, estresse e autoconhecimento. Consultas online com todo suporte necessário.',
                'services': ['Florais', 'Reiki', 'Meditação Guiada'],
                'city': 'Brasília',
                'state': 'DF',
                'price_per_session': 140.00,
                'attendance_type': 'online',
                'whatsapp': '61987654321',
                'phone': '6133334444',
            },
            {
                'username': 'professional7',
                'email': 'roberto.alves@email.com',
                'password': 'senha123',
                'name': 'Roberto Alves',
                'bio': 'Instrutor de Pilates Holístico com foco em consciência corporal e bem-estar integral. Aulas personalizadas combinando movimento, respiração e mindfulness. Resultados transformadores.',
                'services': ['Pilates Holístico', 'Yoga'],
                'city': 'São Paulo',
                'state': 'SP',
                'price_per_session': 130.00,
                'attendance_type': 'presencial',
                'whatsapp': '11988887777',
                'phone': '1144445555',
            },
            {
                'username': 'professional8',
                'email': 'fernanda.rocha@email.com',
                'password': 'senha123',
                'name': 'Fernanda Rocha',
                'bio': 'Mestre em Reiki Usui e Karuna. Realizo sessões de harmonização energética, limpeza de ambientes e iniciações. Trabalho com amor e dedicação há mais de 8 anos ajudando pessoas.',
                'services': ['Reiki', 'Cristaloterapia'],
                'city': 'Florianópolis',
                'state': 'SC',
                'price_per_session': 170.00,
                'attendance_type': 'ambos',
                'whatsapp': '48987654321',
                'phone': '4833334444',
            },
            {
                'username': 'professional9',
                'email': 'marcos.ferreira@email.com',
                'password': 'senha123',
                'name': 'Marcos Ferreira',
                'bio': 'Terapeuta em Medicina Tradicional Chinesa com especialização em Tai Chi Chuan. Aulas e sessões terapêuticas para equilíbrio corpo-mente. Mais de 20 anos de prática e ensino.',
                'services': ['Tai Chi', 'Acupuntura', 'Meditação Guiada'],
                'city': 'Salvador',
                'state': 'BA',
                'price_per_session': 190.00,
                'attendance_type': 'presencial',
                'whatsapp': '71987654321',
                'phone': '7133334444',
            },
            {
                'username': 'professional10',
                'email': 'luciana.martins@email.com',
                'password': 'senha123',
                'name': 'Luciana Martins',
                'bio': 'Reflexoterapeuta certificada especializada em reflexologia podal e auricular. Tratamentos para diversos desequilíbrios através dos pontos reflexos. Sessões relaxantes e terapêuticas.',
                'services': ['Reflexologia', 'Massagem', 'Aromaterapia'],
                'city': 'Recife',
                'state': 'PE',
                'price_per_session': 145.00,
                'attendance_type': 'presencial',
                'whatsapp': '81987654321',
                'phone': '8133334444',
            },
            {
                'username': 'professional11',
                'email': 'beatriz.silva@email.com',
                'password': 'senha123',
                'name': 'Beatriz Silva',
                'bio': 'Instrutora de meditação mindfulness e yoga nidra. Ajudo pessoas a encontrarem paz interior e equilíbrio emocional através de práticas milenares adaptadas ao mundo moderno. Sessões online.',
                'services': ['Meditação Guiada', 'Yoga', 'Florais'],
                'city': 'Campinas',
                'state': 'SP',
                'price_per_session': 110.00,
                'attendance_type': 'online',
                'whatsapp': '19987654321',
                'phone': '1933334444',
            },
            {
                'username': 'professional12',
                'email': 'andre.souza@email.com',
                'password': 'senha123',
                'name': 'André Souza',
                'bio': 'Terapeuta holístico integrativo com formação em diversas técnicas complementares. Atendimento personalizado focado nas necessidades individuais de cada cliente. Presencial e online.',
                'services': ['Reiki', 'Cristaloterapia', 'Florais', 'Aromaterapia'],
                'city': 'Fortaleza',
                'state': 'CE',
                'price_per_session': 155.00,
                'attendance_type': 'ambos',
                'whatsapp': '85987654321',
                'phone': '8533334444',
            },
        ]

        self.stdout.write(f"\nCreating {len(professionals_data)} professionals...\n")

        for data in professionals_data:
            # Create user
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password']
            )
            
            # Create professional profile
            professional = Professional.objects.create(
                user=user,
                name=data['name'],
                bio=data['bio'],
                services=data['services'],
                city=data['city'],
                state=data['state'],
                price_per_session=data['price_per_session'],
                attendance_type=data['attendance_type'],
                whatsapp=data['whatsapp'],
                email=data['email'],
                phone=data['phone']
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ Created: {professional.name} - {', '.join(professional.services[:2])} - {professional.city}/{professional.state}"
                )
            )

        count = Professional.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f"\n✓ Successfully created {count} professionals!")
        )
        self.stdout.write("\nYou can now view them at:")
        self.stdout.write("  - API: http://127.0.0.1:8000/api/v1/professionals/")
        self.stdout.write("  - Frontend: http://localhost:5173/")
