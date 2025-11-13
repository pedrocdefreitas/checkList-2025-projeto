let botaoInserirConteudoNaLista = document.querySelector('#img-btn-inserir').addEventListener('click', acaoInserir)

let textoDaTextArea = document.querySelector('#autoExpand')
let arrayDeItensAtualizado = new Array()
recuperarListaAtualizada()

function acaoInserir(){

   if(!textoDaTextArea.value) return 
   requisicoesXmlHttp("POST", "/salvar", JSON.stringify(textoDaTextArea.value))
   textoDaTextArea.value = ""
   
  
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
            window.location.href = '/'
        } else {
            xhr.send();
        }
    });
         
}

async function recuperarListaAtualizada(){

   
   let conteinerLista = document.querySelector('#itens-lista-de-tarefas')
   let dadosRecebidos = await requisicoesXmlHttp("GET", "/todosositens")

   dadosRecebidos.forEach(element => {

      let item = 
      `
           <article class="item-unit" value="${element.id}">
                  <i class="fa-solid fa-check"></i>
                  <p class="desc-item">${element.item}</p>
                  <div id="icone-menu"><i class="fa-solid fa-ellipsis-vertical"></i></div>
            </article>
      
      `  
      conteinerLista.insertAdjacentHTML( 'beforeend', item)

      

   });

   funcoesDosIcones(dadosRecebidos)

}


async function funcoesDosIcones(dadosRecebidos){

      let elementoPaiItens = document.querySelectorAll('.item-unit')
      let iconeEditar = document.querySelectorAll('#icone-menu')
      let menuParaItens = document.querySelector('#menu-para-itens')
      let lixeiraGeral = document.querySelector('#btn-excluir-tudo')
      let iconeFecharTudo = document.querySelector('#bordas-icone')
      let conteinericonesmenu = document.querySelector('#conteiner-icones-menu')
      let btn_editar_lista = document.querySelector('#menu-para-itens .fa-edit')
      let btn_excluir_item = document.querySelector('#menu-para-itens .fa-trash')
      let btn_marcar_concluido = document.querySelectorAll('.fa-check')

      if( elementoPaiItens.length > 0 ){

            dadosRecebidos.forEach( (el)=>{
               
            })

            iconeEditar.forEach( (tagI)=>{

               tagI.addEventListener('click', function(e){
                  let btn_menu_item = e.target
                  menuParaItens.classList.toggle('mostraMenu')
                  lixeiraGeral.classList.toggle('iconeLixeiraGeralMostra')
                  iconeFecharTudo.classList.toggle('iconeFecharGeral')
                  conteinericonesmenu.classList.toggle('zindex')
               })

            })


            btn_marcar_concluido.forEach( (checkIcone)=>{
               checkIcone.addEventListener('click', acoesCheck)
            })

            function acoesCheck(e){
               console.log('estou na função de chack')
            }

            lixeiraGeral.addEventListener('click', function(){
               console.log('cliquei para excluir toda lista.')
            })

            btn_editar_lista.addEventListener('click', function(){
               console.log('clicando em editar')
            })

            btn_excluir_item.addEventListener('click', function(){
               console.log('clicando em excluir item')
            })

            iconeFecharTudo.addEventListener('click', function () {
               iconeFecharTudo.classList.toggle('iconeFecharGeral')
               menuParaItens.classList.toggle('mostraMenu')
               lixeiraGeral.classList.toggle('iconeLixeiraGeralMostra')
               setTimeout( ()=>{
                  conteinericonesmenu.classList.toggle('zindex')
               }, 500)
               
            })



            console.log( iconeFecharTudo )

      }else{
         console.error('Array de itens não está no DOM...')
      }


}
   
