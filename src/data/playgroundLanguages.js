export const languages = {
  python: { label: 'Python', file: 'main.py' },
  java: { label: 'Java', file: 'prog.java' },
  javascript: { label: 'JavaScript', file: 'main.js' },
};

export const variants = {
  'bro-fit': {
    javascript: `// Demonstracao da ficha de treino do Bro Fit.
const aluno = "Carlos";
const ficha = [
  { nome: "Agachamento Livre", series: 3, repeticoes: 10 },
  { nome: "Supino Reto", series: 4, repeticoes: 12 },
  { nome: "Rosca Direta", series: 3, repeticoes: 10 },
  { nome: "Leg Press", series: 3, repeticoes: 15 },
];
const remover = "Supino Reto";
const series = 3, repeticoes = 10;
const plano = ficha.filter(ex => ex.nome !== remover);
console.log("BRO FIT | Ficha de " + aluno);
for (const ex of plano) console.log(ex.nome + ": " + ex.series + " x " + ex.repeticoes);
console.log("Exercicios encontrados:", plano.filter(ex => ex.series === series && ex.repeticoes === repeticoes).length);`,
    java: `import java.util.ArrayList;

// Demonstracao autocontida baseada em Plano.java e MainTest.java.
class Main {
    record Exercicio(String nome, int series, int repeticoes) {}

    public static void main(String[] args) {
        String aluno = "Carlos";
        var ficha = new ArrayList<Exercicio>();
        ficha.add(new Exercicio("Agachamento Livre", 3, 10));
        ficha.add(new Exercicio("Supino Reto", 4, 12));
        ficha.add(new Exercicio("Rosca Direta", 3, 10));
        ficha.add(new Exercicio("Leg Press", 3, 15));
        String remover = "Supino Reto";
        int series = 3, repeticoes = 10;
        ficha.removeIf(ex -> ex.nome().equalsIgnoreCase(remover));
        System.out.println("BRO FIT | Ficha de " + aluno);
        for (var ex : ficha) {
            System.out.printf("%s: %d x %d%n", ex.nome(), ex.series(), ex.repeticoes());
        }
        long encontrados = ficha.stream().filter(ex -> ex.series() == series && ex.repeticoes() == repeticoes).count();
        System.out.println("Exercicios encontrados: " + encontrados);
    }
}`,
  },
  cart: {
    javascript: `// Precos em centavos para manter a precisao.
const estoque = {
  "101": { nome: "Camiseta Algodao", preco: 5000, quantidade: 20 },
  "102": { nome: "Calca Jeans", preco: 12000, quantidade: 15 },
  "103": { nome: "Tenis Esportivo", preco: 25000, quantidade: 10 },
};
const pedido = [["101", 2], ["102", 1], ["103", 1]];
let total = 0;
console.log("CARRINHO | Fatura");
for (const [codigo, quantidade] of pedido) {
  const produto = estoque[codigo];
  if (!produto || !Number.isInteger(quantidade) || quantidade <= 0 || quantidade > produto.quantidade) {
    console.log("Pedido invalido ou estoque insuficiente:", codigo);
    continue;
  }
  produto.quantidade -= quantidade;
  const subtotal = produto.preco * quantidade;
  total += subtotal;
  console.log(quantidade + " x " + produto.nome + ": R$ " + (subtotal / 100).toFixed(2));
}
console.log("TOTAL: R$ " + (total / 100).toFixed(2));
for (const produto of Object.values(estoque)) console.log(produto.nome + ": " + produto.quantidade + " em estoque");`,
    java: `import java.util.LinkedHashMap;

// Demonstracao autocontida. Precos em centavos.
class Main {
    static class Produto {
        String nome;
        int preco, quantidade;
        Produto(String nome, int preco, int quantidade) {
            this.nome = nome;
            this.preco = preco;
            this.quantidade = quantidade;
        }
    }
    public static void main(String[] args) {
        var estoque = new LinkedHashMap<Integer, Produto>();
        estoque.put(101, new Produto("Camiseta Algodao", 5000, 20));
        estoque.put(102, new Produto("Calca Jeans", 12000, 15));
        estoque.put(103, new Produto("Tenis Esportivo", 25000, 10));
        int[][] pedido = {{101, 2}, {102, 1}, {103, 1}};
        long total = 0;
        System.out.println("CARRINHO | Fatura");
        for (int[] item : pedido) {
            var produto = estoque.get(item[0]);
            int quantidade = item[1];
            if (produto == null || quantidade <= 0 || quantidade > produto.quantidade) {
                System.out.println("Pedido invalido ou estoque insuficiente: " + item[0]);
                continue;
            }
            produto.quantidade -= quantidade;
            long subtotal = (long) produto.preco * quantidade;
            total += subtotal;
            System.out.printf("%d x %s: R$ %.2f%n", quantidade, produto.nome, subtotal / 100.0);
        }
        System.out.printf("TOTAL: R$ %.2f%n", total / 100.0);
        for (var produto : estoque.values()) System.out.println(produto.nome + ": " + produto.quantidade + " em estoque");
    }
}`,
  },
};
