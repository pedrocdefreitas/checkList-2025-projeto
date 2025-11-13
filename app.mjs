import http from 'http'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { Console, error } from 'console';

const app = express()
let arrayAuxiliarTemporario = []
let PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


(function(){
    try{

      if(criaArquivoJSON()){
         return true
      }
   }catch ( err ){

      console.error( err )
      return  false

   }
})()


app.use(express.static(__dirname));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'json')));
app.use(express.text({type: 'text/plain'}));
criaDiretorio()


app.post('/salvar', ( req, res)=>{

   let item = req.body

   try{
      salvaLista(item)
      recuperarListaAtualizada()
      res.send("<h1>Item inserido com sucesso!</h1>")
   }catch ( err ){
      console.log( err )
   }
   
   
})

app.get('/todosositens', (req, res) => {
   let file = path.join(__dirname, 'dados', 'itens.json')
   let todosOsItens = JSON.parse(fs.readFileSync(file, 'utf-8'))
   res.send(todosOsItens)
})


function salvaLista(item, req, res) {

   const file = path.join(__dirname, '/dados', 'itens.json')
   let lerJSON;
   
   let itemCorrigido = JSON.parse(item);
   
   let dataAtual = new Date

   let obj_de_itens = {
      id: Date.now(),
      item: itemCorrigido,
      is_fim: 'false',
      data: dataAtual.toLocaleDateString('pt-BR')
   }

   try{

      const data = fs.readFileSync(file, 'utf8');

      lerJSON = Array.from(JSON.parse(data));
      lerJSON.push(obj_de_itens)

      const jsonParaEscrever = JSON.stringify(lerJSON, null, 2);
   
      fs.writeFileSync(file, jsonParaEscrever, 'utf8', (err) => {

         if (err) {
            console.error("Erro ao escrever:", err);
            return false;
         }

         console.log("Escrita com sucesso!");
         return true;
      });


   } catch ( err ){

      console.error( err )
      return false
   }

  

}

function criaDiretorio() {

   const diretorio = path.join(__dirname, '/dados')

   try{

      let exist = fs.existsSync(diretorio)
      if( exist ) return true
      fs.mkdirSync(diretorio, {recursive: true})
      console.log(`Diretório '${diretorio}' criado (ou já existente) com sucesso!`);

   } catch ( err ){

      console.error('Erro ao criar a pasta "DADOS')
      console.error(err)

   }

   return true
}

function  criaArquivoJSON() {

   const arquivo_JSON = path.join(__dirname, '/dados/itens.json')

   try{

      if(criaDiretorio())
      
      if( !fs.existsSync(arquivo_JSON) ){

         fs.writeFileSync(arquivo_JSON, JSON.stringify([], null, 2), 'utf-8')
         return true

      }

   } catch ( err ){

      console.error('Erro dento do cacth na função Cria Arquivo JSon.')
      console.error(err)
      return false

   }

}

app.listen(PORT, (req, res)=>{
   console.log(`\n🚀 Servidor Express rodando em: http://localhost:${PORT}`);
   console.log('Use CTRL+C para parar o servidor.');
   
})

