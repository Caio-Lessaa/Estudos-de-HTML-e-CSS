let nome = "Caio";

let idade = 21;

console.log("Meu nome é " + nome + " e eu tenho " + idade + " anos!");

let eMaiorDeIdade = idade >= 18;

console.log("É maior de idade? " + (eMaiorDeIdade ? "Sim" : "Não"));

let endereco = null; 



// let, const, var (tipos de variáveis em js)
// const : não pode ser alterada o valor atribuido, e é necessário ser inicializada logo ao se declarar


const pi = 3.14

console.log(pi)

try {
    pi = 5;
} catch (error) {
    console.log("A variavel pi é uma constante, portanto não pode ser alterada!");
}


console.log(pi);