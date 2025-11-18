animaItens()
ListaDosItensViaSSE()

let botaoInserirConteudoNaLista = document.querySelector('#img-btn-inserir').addEventListener('click', acaoInserir)


let textoDaTextArea = document.querySelector('#autoExpand')
let arrayDeItensAtualizado = new Array()


function acaoInserir(event){

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
                  <i class="fa-solid fa-check"></i>
                  <p class="desc-item">${element.item}</p>
                  <div id="icone-menu"><i class="fa-solid fa-ellipsis-vertical"></i></div>
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

         // console.log("Tamanho da lista recebida:", updatedTodos.length);

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

async function concluirTarefa(dados){

   let iconeCheck = document.querySelectorAll('.fa-check') 
   let lista = await requisicoesXmlHttp('GET', "/api/lista") 
  

   iconeCheck.forEach( (iconeCheck)=>{

      iconeCheck.parentElement.addEventListener('click', (event)=>{ 

      let TAG_item = event.target.parentElement
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

         
         const JSONSTRING = JSON.stringify(copiaDalista);
         requisicoesXmlHttp('POST', '/api/tarefaCompleta', JSONSTRING )
      
      })
   })
   
}

















window.onload = function () 
{  
concluirTarefa()
}
