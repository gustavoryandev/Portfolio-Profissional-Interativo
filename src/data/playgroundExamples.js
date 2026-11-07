export const playgroundExamples = [
  {
    id: 'bro-fit', pt: 'Bro Fit · Ficha de treino', en: 'Bro Fit · Workout plan',
    source: 'https://github.com/gustavoryandev/Plano-gerenciamento-academia',
    code: `# Adaptacao em Python de Plano.java e MainTest.java.
# Altere a ficha e os filtros abaixo, depois execute.
aluno = "Carlos"
ficha = [
    {"nome": "Agachamento Livre", "series": 3, "repeticoes": 10},
    {"nome": "Supino Reto", "series": 4, "repeticoes": 12},
    {"nome": "Rosca Direta", "series": 3, "repeticoes": 10},
    {"nome": "Leg Press", "series": 3, "repeticoes": 15},
]
series_busca = 3
repeticoes_busca = 10
remover = "Supino Reto"

ficha = [ex for ex in ficha if ex["nome"].lower() != remover.lower()]
print(f"BRO FIT | Ficha de {aluno}")
for ex in ficha:
    print(f'{ex["nome"]}: {ex["series"]} x {ex["repeticoes"]}')

encontrados = sum(
    ex["series"] == series_busca and ex["repeticoes"] == repeticoes_busca
    for ex in ficha
)
print(f"\\nExercicios com {series_busca} x {repeticoes_busca}: {encontrados}")`,
  },
  {
    id: 'cart', pt: 'Carrinho de Compras', en: 'Shopping Cart',
    source: 'https://github.com/gustavoryandev/Pratica02-CarrinhoDeCompras',
    code: `# Adaptacao em Python de Carrinho.java, Produto.java e Item.java.
# Edite os pares (codigo, quantidade) do pedido.
from decimal import Decimal

estoque = {
    "101": {"nome": "Camiseta Algodao", "preco": Decimal("50.00"), "quantidade": 20},
    "102": {"nome": "Calca Jeans", "preco": Decimal("120.00"), "quantidade": 15},
    "103": {"nome": "Tenis Esportivo", "preco": Decimal("250.00"), "quantidade": 10},
}
pedido = [("101", 2), ("102", 1), ("103", 1)]
total = Decimal("0.00")

print("CARRINHO | Fatura")
for codigo, quantidade in pedido:
    produto = estoque.get(codigo)
    if produto is None:
        print(f"Produto {codigo} nao encontrado")
        continue
    if not isinstance(quantidade, int) or quantidade <= 0:
        print(f"Quantidade invalida para {codigo}")
        continue
    if quantidade > produto["quantidade"]:
        print(f"Estoque insuficiente para {produto['nome']}")
        continue
    produto["quantidade"] -= quantidade
    subtotal = produto["preco"] * quantidade
    total += subtotal
    print(f"{quantidade} x {produto['nome']}: R$ {subtotal:.2f}")

print(f"TOTAL: R$ {total:.2f}")
print("\\nESTOQUE RESTANTE")
for produto in estoque.values():
    print(f"{produto['nome']}: {produto['quantidade']}")`,
  },
];
