import http from 'http'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { Console, error } from 'console';
const app = express()
let activeClients = [];
let PORT = 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'json')));
app.use(express.text({type: 'text/plain'}));
criaDiretorio()
criaArquivoJSON()



// { Inicio: Seção de rotas }

app.post('/salvar', ( req, res)=>{
   // { Aqui eu recebo o item vindo do campo de texto lá da tela do cliente. }
   let item = req.body
   

   try{
      salvaItemNaListaEmDisco(item)
      res.end("Dado inserido com sucesso!")
      // { Essa função salva o novo item no arquivo JSON em disco. }
   }catch ( err ){
      console.error( err )
   }

})

app.get('/api/todos/stream', (req, res)=>{

   res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
   res.setHeader('Cache-Control', 'no-cache');
   res.setHeader('Connection', 'keep-alive');
   res.status(200);

   activeClients.push(res);

   let listAtual = lerArquivoJsonAtualizado()
   const initialMessage = `data: ${JSON.stringify(listAtual)}\n\n`;

   res.write(initialMessage);

   // res.flush();

   req.on('close', () => {

        activeClients = activeClients.filter(client => client !== res);
        console.log(`Cliente desconectado. Total de clientes: ${activeClients.length}`);
    });


})

app.get('/api/lista', ( req, res )=>{

   let file = path.join(__dirname, 'dados', 'itens.json')
   const data = JSON.parse(fs.readFileSync(file, 'utf8'))
   return res.send(data)

})

app.post('/api/tarefaCompleta', ( req, res )=>{

   const file = path.join(__dirname, 'dados', 'itens.json')
   const tarefaRecebida = req.body; 
  
   try{
      fs.writeFileSync(file, tarefaRecebida)
      res.status(200).send({ message: "Tarefa concluída e salva com sucesso." });

   }catch(err){
      return new Error('Erro ao concluir item. ')
   }

   
})

app.post('/api/atualizarLista', ( req, res )=>{

   try{

      let respostaDoFront = req.body
      const file = path.join(__dirname, 'dados', 'itens.json')
      fs.writeFileSync(file, respostaDoFront)
      res.status(200).send({ message: "Tarefa concluída e salva com sucesso.", status: 200 });
      
   }catch(e){
      console.error(e)
      res.status(400).send({ message: "Tarefa de edição deu ruim...", status: 400 });
   }
   
})

app.post('/app/deleteItem', (req, res)=>{

      let respostaDoFront = req.body
      const file = path.join(__dirname, 'dados', 'itens.json')
      fs.writeFileSync(file, respostaDoFront)
      res.status(200).send({ message: "Tarefa concluída e salva com sucesso.", status: 200 });
      res.send("Rota para deletar item...")

})

app.post('/api/deletarListaCompleta', (req, res)=>{
      
      const file = path.join(__dirname, 'dados', 'itens.json')
      fs.writeFileSync(file, '[]')
      res.send('Rota para deletar lista completa...')
})

// { ROTA DE TESTE }
app.get('/shortURL/:identificador', (req, res)=>{

   let identificadorUser = req.params.identificador
   console.log(identificadorUser)

   if( identificadorUser == 'pedro'){

      setTimeout( ()=>{
         res.redirect('https://www.google.com.br')
      }, 3000)

   }else{
      res.send('<h1>Usuário não encontrado</h1>')
   }
   

})

// { Funções necessárias para o sistema funcionar }

function salvaItemNaListaEmDisco(item, req, res) {
   //Função realiza a atualização dos itens no arquivo JSON.

   const arquivoDeListaSalvoNoDisco = path.join(__dirname, '/dados', 'itens.json')

   const dadosDoItem = criaObjetoToDoList(item)
   if(!dadosDoItem) return console.error("Erro ao criar o objeto com o item vindo do cliente...")

   // { lendo lista atualizada do disco }
   let leituraDoJSONAtual = JSON.parse(fs.readFileSync(arquivoDeListaSalvoNoDisco))
   
   leituraDoJSONAtual.push(dadosDoItem)

   const jsonAtual = JSON.stringify(leituraDoJSONAtual, null, 2);
   fs.writeFileSync(arquivoDeListaSalvoNoDisco, jsonAtual, 'utf8');

}

function criaObjetoToDoList(item){
   // { Função para criação do objeto de item com suas propriedades }
   let dataAtual = new Date

   let obj_de_itens = {

      id: Date.now(),
      item: JSON.parse(item),
      is_fim: 'false',
      data: dataAtual.toLocaleDateString('pt-BR')

   }

   return obj_de_itens
}

function lerArquivoJsonAtualizado(){

   let file = path.join(__dirname, 'dados', 'itens.json')
   const data = fs.readFileSync(file, 'utf8')
   return JSON.parse( data )

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

