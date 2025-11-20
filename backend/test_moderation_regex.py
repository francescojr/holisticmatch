import re

PROHIBITED_PATTERNS = [
    r'\b(matar|morte|morrer|suicida|puta|desgraçado|buceta|caralho|porra|merda|fodido|foder|fuder)\b',
    r'\b(vou te|vou lhe|vou matar|vou bater|vou estuprar|vou explodir)\b',
    r'\b(ameaça|ameaço|vou|matei|mataria|bateria|estuprei|xingo)\b',
    r'\b(sexo|pornô|porno|pornografia|buceta|pinto|peito|anal|oral|trepar|transar)\b',
    r'\b(nudes|nude|cam|camgirl|sexting|vibrador|dildo)\b',
    r'\b(xingamento|xingo|xingue|chamego|racista|racismo|homofobia|lgbtfobia)\b',
    r'\b(filho da puta|desgraçado|miserável|idiota|imbecil|retardado|débil)\b',
    r'\b(cocaína|crack|heroína|maconha|droga|drogas|traficante|trafico)\b',
    r'\b(preto|negão|macaco|judeu|turco|gordo|gorda|aleijado|retardado|deficiente)\b',
]

test_words = ['caralho', 'buceta', 'porra', 'merda', 'sexo', 'xingo', 'filho da puta', 'terapeuta', 'reiki']

print("🧪 Testando regex patterns:\n")
for word in test_words:
    blocked = False
    for pattern in PROHIBITED_PATTERNS:
        if re.search(pattern, word.lower(), re.IGNORECASE):
            blocked = True
            break
    status = "❌ BLOQUEADO" if blocked else "✅ PASSOU"
    print(f"  {word:20} -> {status}")
