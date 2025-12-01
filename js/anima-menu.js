let icones = document.querySelectorAll('.icones-menu-principal')
let bolha = document.querySelector('.booble-cicle-color')


icones.forEach( itens => {
   itens.addEventListener('click', (e)=>{
      
      bolha.classList.add('booble-cicle-color-efeito')
      setTimeout( ()=>{
         bolha.classList.remove('booble-cicle-color-efeito')
      }, 1000)
      
   })
})

