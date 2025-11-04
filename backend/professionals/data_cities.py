# Brazilian cities data by state - Simplified version with major cities
# Used for City model seeding
# Limitation: This is a simplified version for demonstration
# In production, use a complete dataset from IBGE (Brazilian Institute of Geography and Statistics)

BRAZILIAN_CITIES = {
    'SP': [
        'São Paulo', 'Campinas', 'Ribeirão Preto', 'Santos', 'Sorocaba', 'Mauá', 'Osasco', 
        'Guarulhos', 'Taboão da Serra', 'São Bernardo do Campo', 'Diadema', 'Carapicuíba', 
        'Bauru', 'Piracicaba', 'Franca', 'Araraquara', 'Jundiaí', 'Limeira', 'Rio Claro',
        'Presidente Prudente', 'Araçatuba', 'São José do Rio Preto', 'Itu', 'Botucatu'
    ],
    'RJ': [
        'Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'São Gonçalo', 'Nova Iguaçu', 
        'São João de Meriti', 'Campos dos Goytacazes', 'Itaboraí', 'Macaé', 'Cabo Frio',
        'Araruama', 'Volta Redonda', 'Teresópolis', 'Petrópolis', 'Resende', 'Mesquita'
    ],
    'MG': [
        'Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros',
        'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Divinópolis', 'Ouro Preto',
        'Barbacena', 'Araxá', 'Patos de Minas', 'Conselheiro Lafaiete', 'Passos'
    ],
    'BA': [
        'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Lauro de Freitas',
        'Ilhéus', 'Itabuna', 'Jequié', 'Teixeira de Freitas', 'Santo Estêvão', 'Senhor do Bonfim',
        'Valença', 'Gandu', 'Tucano', 'Entre Rios'
    ],
    'CE': [
        'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral', 'Crato', 'Maracanaú', 
        'Iguatu', 'Quixadá', 'Aquiraz', 'Maranguape', 'Pacajus', 'Itapipoca'
    ],
    'RS': [
        'Porto Alegre', 'Caxias do Sul', 'Novo Hamburgo', 'Gravataí', 'Viamão', 'Pelotas',
        'Santa Maria', 'Almeida', 'Canoas', 'São Leopoldo', 'Sapucaia do Sul', 'Bagé',
        'Rio Grande', 'Passo Fundo', 'Lajeado', 'Bento Gonçalves'
    ],
    'PE': [
        'Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Paulista', 'Caruaru', 'Petrolina',
        'Camaragibe', 'Vitória de Santo Antão', 'Igarassu', 'Araçoaba', 'Santa Cruz do Capibaribe'
    ],
    'PR': [
        'Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais',
        'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Apucarana', 'Cornélio Procópio',
        'Campo Largo', 'Araucária', 'Piraquara'
    ],
    'SC': [
        'Florianópolis', 'Blumenau', 'Joinville', 'Chapecó', 'Itajaí', 'Criciúma', 'Lages',
        'Brusque', 'Tubarão', 'Rio do Sul', 'Imbituba', 'Balneário Camboriú', 'São Bento do Sul'
    ],
    'GO': [
        'Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Luziânia', 'Águas Lindas de Goiás',
        'Senador Canedo', 'Formosa', 'Jataí', 'Rio Verde', 'Catalão', 'Goianésia', 'Itumbiara'
    ],
    'MT': [
        'Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Sorriso',
        'Cáceres', 'Alta Floresta', 'Barra do Garças', 'Pontes e Lacerda'
    ],
    'MS': [
        'Campo Grande', 'Dourados', 'Três Lagoas', 'Maracaju', 'Corumbá', 'Aquidauana',
        'Coxim', 'Naviraí', 'Nova Andradina', 'Paranaíba'
    ],
    'MA': [
        'São Luís', 'Imperatriz', 'Timon', 'Caxias', 'Codó', 'Bacabal', 'Açailândia',
        'Balsas', 'Grajaú', 'Santa Rita'
    ],
    'PI': [
        'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Campo Maior', 'Oeiras', 'São Raimundo Nonato',
        'Floriano', 'Esperantina', 'União'
    ],
    'PA': [
        'Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Altamira', 'Itaituba',
        'Breves', 'Tucuruí', 'Conceição do Araguaia'
    ],
    'PB': [
        'João Pessoa', 'Campina Grande', 'Guarabira', 'Patos', 'Sousa', 'Cajazeiras',
        'Monteiro', 'Coremas', 'Princesa Isabel', 'Pombal'
    ],
    'RN': [
        'Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Ceará-Mirim', 'Caicó',
        'Açu', 'Assu', 'Macau', 'Currais Novos'
    ],
    'AL': [
        'Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'Penedo', 'Marechal Deodoro',
        'Viçosa', 'São Miguel dos Campos', 'Atalaia', 'Piranhas'
    ],
    'AM': [
        'Manaus', 'Itacoatiara', 'Parintins', 'Manacapuru', 'Tabatinga', 'Humaitá',
        'Iranduba', 'Anori', 'Coari', 'Presidente Figueiredo'
    ],
    'AC': [
        'Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Xapuri',
        'Brasiléia', 'Plácido de Castro', 'Epitaciolândia', 'Acrelândia'
    ],
    'RO': [
        'Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Jaru', 'Vilhena', 'Cacoal', 'Ouro Preto do Oeste',
        'Rolim de Moura', 'Guajará-Mirim', 'Costa Marques'
    ],
    'RR': [
        'Boa Vista', 'Rorainópolis', 'Caracaraí', 'Cantá', 'Mucajaí', 'São Juan do Balam',
        'Iracema', 'Normandia', 'Pacaraima', 'Amajari'
    ],
    'AP': [
        'Macapá', 'Santana', 'Mazagão', 'Oiapoque', 'Amapá', 'Pedra Branca do Amapari',
        'Calçoene', 'Tartarugalba', 'Ferreira Gomes', 'Serra do Navio'
    ],
    'TO': [
        'Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Tocantinópolis', 'Arraias',
        'Dianópolis', 'Natividade', 'Peixe', 'Guaraí'
    ],
    'SE': [
        'Aracaju', 'São Cristóvão', 'Lagarto', 'Nossa Senhora do Socorro', 'Itabaiana',
        'Estância', 'Própria', 'Simão Dias', 'Tobias Barreto', 'Poço Redondo'
    ],
    'DF': [
        'Brasília'
    ]
}
