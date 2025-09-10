let nome = "Caio";

let idade = 21;

console.log("Meu nome é " + nome + " e eu tenho " + idade + " anos!");

//let eMaiorDeIdade = idade >= 18;

console.log("É maior de idade? ", eMaiorDeIdade ? "Sim" : "Não");

let endereco = null; 



// let, const, var (tipos de variáveis em js)
// const : não pode ser alterada o valor atribuido, e é necessário ser inicializada logo ao se declarar
// let tem escopo de bloco
// var tem escopo global

const pi = 3.14

console.log(pi)

try {
    pi = 5;
} catch (error) {
    console.log("A variavel pi é uma constante, portanto não pode ser alterada!");
}


console.log(pi);

let diaSemana = 5;

switch (diaSemana) {
    case 1: 
        console.log("Domingo");
        break;
    case 2: 
        console.log("Segunda");
        break;
    case 3:
        console.log("Terça");
        break;
    case 4:
        console.log("Quarta");
        break;
    case 5: 
        console.log("Quinta");
        break;
    case 6: 
        console.log("Sexta");
        break;
    case 7:
        console.log("Sábado");
        break;
    default:
        console.log("Dia não está dentre o intervalo de 1 a 7");
}


let idades = [idade, 15, 17, 67]; 

function eMaiorDeIdade(idade) {
    return idade >= 18;
}

for(let i = 0; i < idades.length; i++) {
    let idade = idades[i];
    if(eMaiorDeIdade(idade)) {
        console.log("A idade " + idade + " é maior de idade"); 
    }else {
        console.log("A idade " + idade + " é menor de idade"); 
    }
}