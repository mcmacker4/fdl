import { Tokenizer } from './compiler/tokenizer'
import { Parser } from './compiler/parser';

new Tokenizer().tokenize('machine.fdl').then(tokens => {
    
    const components = new Parser(tokens).parse()

    components.forEach(comp => {
        console.log(comp)
    })

}).catch(console.error)