document.querySelector('#img-btn-inserir').addEventListener('click', ()=>{

   if(!document.querySelector('#autoExpand').hasAttribute('data-mode')){
      console.log('Ativando o botão para inserir...')
      acaoInserir()
      return
   }else{
      console.log('Ativando o botão de editar...')
      editandoItens()
      return
   }
})

document.addEventListener('DOMContentLoaded', function() {

      console.log("DOM (estrutura HTML) totalmente carregado!");
      ListaDosItensViaSSE()
      animaItens()
      
});


function acaoInserir(event){

   let textoDaTextArea = document.querySelector('#autoExpand')
   if(!textoDaTextArea.value) return alert('Campo vazio!')
   requisicoesXmlHttp("POST", "/salvar", JSON.stringify(textoDaTextArea.value))
   textoDaTextArea.value = ""
   ListaDosItensViaSSE()
   
}

function requisicoesXmlHttp(metodo, url, dados){

   return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(metodo, url, true);

        xhr.onreadystatechange = function(){

            if(xhr.readyState == 4){
                
                if(xhr.status < 200 || xhr.status >= 300 || xhr.responseText.trim() === ""){
                    
                    if(xhr.status >= 400){
                        reject(new Error(`Erro HTTP: ${xhr.status} ${xhr.statusText}. Resposta: ${xhr.responseText}`));
                        return;
                    }
                    
                    resolve(null);
                    return;
                }
                

                try {
                    let resposta = JSON.parse(xhr.responseText);
                    resolve(resposta);
                } catch (e) {
                    reject(new Error("Erro ao parsear JSON: " + e.message + ". Conteúdo: " + xhr.responseText.substring(0, 50) + "..."));
                }
            }
        };

        xhr.onerror = function() {
            reject(new Error('Erro de rede/conexão.'));
        };

        if(metodo.toUpperCase() == "POST"){
            xhr.send(dados);
        } else {
            xhr.send();
        }
    });
         
}

async function updateTodoListDisplay(updatedTodos){

   let conteinerLista = document.querySelector('#itens-lista-de-tarefas')
   conteinerLista.innerHTML = '';

   updatedTodos.forEach(element => {
 
     
      let item = 
      `
           <article class="item-unit" value="${element.id}" concluido="${element.is_fim}">
                  <div id="icone-check"><i class="fa-solid fa-check"></i></div>
                  <p class="desc-item">${element.item}</p>

                  <div id="icone-menu-item">

                        <div id="btn-edicao-dos-itens" class="cicle-tag-i">
                           <i class="fa-solid fa-ellipsis-vertical"></i>
                        </div>

                        <div id="btn-excluir-item" class="cicle-tag-i">
                           <i class="fa-solid fa-trash"></i>
                        </div>

                  </div>

            </article>
      
      `  

      conteinerLista.insertAdjacentHTML( 'beforeend', item)
      // conteinerLista.setAttribute('class', 'item-unit.animate-jelly')

   });

   
}

function ListaDosItensViaSSE(){
   
   const eventSource = new EventSource('/api/todos/stream');

   eventSource.onopen = function() {
      console.log("Conexão SSE estabelecida com sucesso.");
   };

   eventSource.onmessage = function(event){
      // console.log("MENSAGEM SSE RECEBIDA:", event.data);

      try{
         
         const updatedTodos = JSON.parse(event.data);
         updateTodoListDisplay(updatedTodos)
         alteraFormatacaoItem()
         editandoItens()
         deletandoItem()
         deletarListaCompleta()
         concluirTarefa()
      

      } catch (err){
         console.error("Erro ao analisar os dados recebidos:", err);
      }

   }

   // eventSource.onerror = function(err){
   //    console.error("Erro de Conexão SSE. O navegador está tentando reconectar...", err);
   // }

   
}

function animaItens() { 
   
   
   window.onload = function () {  

      let itens =  document.querySelectorAll('.item-unit')
    
         itens.forEach( (elemento)=>{
         elemento.classList.add('animate-jelly')
         })

   }
   
}

async function concluirTarefa(){

   console.log('abriu a função de conluir tarefa')

   let iconeCheck = document.querySelectorAll('.fa-check') 
   let lista = await requisicoesXmlHttp('GET', "/api/lista") 
   

   iconeCheck.forEach( (iconeCheck)=>{

      iconeCheck.parentElement.addEventListener('click', (event)=>{ 

      let TAG_item = event.target.parentElement.parentElement
      let TAG_Value = TAG_item.getAttribute('value')
      
      
         let copiaDalista = lista.map( (elemento) => {

            if( elemento.id == TAG_Value){ 
               // { Aqui estou filtrando o array de objetos pelo ID do elemento redenrizado na tela }
              return {
                  ... elemento,
                  is_fim: true
               }
            }

            return elemento
            
         })

      
         const JSONSTRING = JSON.stringify(copiaDalista, null, 2);
         requisicoesXmlHttp('POST', '/api/tarefaCompleta', JSONSTRING )
      
      })
   })
   
}



function alteraFormatacaoItem() {


   let itemEmTela = document.querySelectorAll('.item-unit')
   
   
   let NodeListFormatado = itemEmTela.forEach( (item)=>{

      if( item.getAttribute('concluido') == 'true' ){
         item.classList.add('itemConcluido')
      }
   })
   

}

// { Configurações para icone de Edição de itens }
async function editandoItens(){

         let btnInserirConteudo = document.querySelector('#img-btn-inserir')
         let textArea = document.querySelector('#autoExpand')
         let btnEditarItens  = document.querySelectorAll('#btn-edicao-dos-itens')
         let lista = await requisicoesXmlHttp('GET', '/api/lista')

         btnEditarItens.forEach( (item)=>{
            item.addEventListener('click', abrirEdicao)
         })

         function abrirEdicao(e) {  

            let textoItem = e.target.closest('article').querySelector('p').innerHTML
            let idItemClicado = e.target.closest('article').getAttribute('value')
            textArea.setAttribute('data-mode', "edit")
            textArea.value = textoItem
        
            btnInserirConteudo.addEventListener('click', async function () {  

               if( !textArea.value ) return alert('Campo vazio!')

               let arrayEditado = lista.filter( (item)=>{

                  if( item.id == idItemClicado){
                     item.item = textArea.value
                  }

                  return item

               })

              await requisicoesXmlHttp('POST', '/api/atualizarLista', JSON.stringify(arrayEditado))

              textArea.value = ""
              
            
            })

         }


}
         
        

// { Configurações para o icone de exclusão de itens }
function deletandoItem(){

            let iconeExcluirItem = document.querySelectorAll('#btn-excluir-item')
            iconeExcluirItem.forEach( (botao)=>{

            botao.addEventListener("click", async (e)=>{

                        const iconeAtualExclusao = e.target.closest('article')
                        let idDoItemAtual = iconeAtualExclusao.getAttribute('value')
                        
                        let lista = await requisicoesXmlHttp('GET', '/api/lista')

                        let isConfirma = confirm('Confirma a exclusão do item?')

                        if( !isConfirma == true ) return

                        function deletarItemComForEac(){

                           let arrCopia;

                           lista.forEach( (item)=>{
                              if( item.id == idDoItemAtual ){
                                 lista.splice(0, 1)
                                    arrCopia = lista
                              }
                           })

                           return arrCopia
                        }

                        function deletandoItemComFilter(){
                           
                           let retornoFilter = lista.filter( (item)=>{

                              if( item.id == idDoItemAtual ){
                                 alert(`item: ${item.item} excluido com sucesso...`)
                              }

                              if( item.id != idDoItemAtual ){
                                 return item
                              }

                           })
                           
                           return retornoFilter

                        }

                        let retornoDoArrayComItemDeletado = deletandoItemComFilter()
               
                        await requisicoesXmlHttp('POST', '/app/deleteItem', JSON.stringify(retornoDoArrayComItemDeletado))
                  
            })

         })

}


async function deletarListaCompleta(){

   let botaoLixeiraGeral = document.querySelector('.excluir-toda-a-lista')

   botaoLixeiraGeral.addEventListener('click', function(){
      console.log('cliquei no botão de exlcuir tudo...')
      let isConfirma = confirm('Tem certeza que deseja excluir todos os itens?')
      if(!isConfirma) return

      let xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/deletarListaCompleta", true)
      xhr.send()
   })

}
