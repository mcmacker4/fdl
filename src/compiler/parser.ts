import { Token } from './tokenizer'
import { ok, equal } from 'assert'
import { Component, Port, Dependency, Connection } from '../component';

export class Parser {

    components: Component[] = []
    tokens: Token[]

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    private next() : Token {
        return this.tokens.shift()
    }

    private parsePort(component: Component) : Port {
        // First token is either "in" or "out"
        const type = this.next().value;
        ok(["in", "out"].indexOf(type) >= 0)
        //TODO: some kind of checking for valid types
        let name = this.next().value
        return new Port(type, name, component)
    }

    private parseDependency() : Dependency {
        const compName = this.next()
        const component = this.components.find(comp => comp.name === compName.value)
        if(!component)
            throw new Error(`[Line ${compName.line}] Unknown Component: ${compName.value}`)
        const name = this.next().value
        return new Dependency(component, name)
    }

    private parseDependencies() : Dependency[] {
        equal(this.next().value, "dependencies")

        const dependencies: Dependency[] = []
        while(this.tokens[0].value !== "end") {
            const dep = this.parseDependency()
            dependencies.push(dep)
        }

        //Consume "end" token
        equal(this.next().value, "end")

        return dependencies
    }

    private findPort(name: string, component: Component, lineNum: number) : Port {

        if(name.indexOf('.') >= 0) {
            //Name references a dependency
            const parts = name.split('.')
            if(parts.length > 2)
                throw new Error(`[Line ${lineNum}] Invalid port name: ${name}`)
            
            //Find dependency by name
            const dep = component.dependencies.find(d => d.name === parts[0])
            if(!dep)
                throw new Error(`[Line ${lineNum}] Unknown component name: ${parts[0]}`)
            
            const port = dep.component.ports.find(p => p.name === parts[1])
            if(!port)
                throw new Error(`[Line ${lineNum}] Component ${parts[0]} has no port named ${parts[1]}`)
            
            return port

        } else {
            const port = component.ports.find(p => p.name === name)
            if(!port)
                throw new Error(`[Line ${lineNum}] Unknown port ${name}`)
            return port
        }

    }

    private parseConnection(component: Component) : Connection {
        equal(this.next().value, "from")

        //Find start port
        let name = this.next()
        const from = this.findPort(name.value, component, name.line)
        
        if((from.component == component) ? from.type !== "in" : from.type !== "out") {
            //Incorrect flow direction
            console.log("FROM: to.comp === comp: " + (from.component === component))
            throw new Error(`[Line ${name.line}] Port configuration mismatch: ${name.value}`)
        }

        //Assert
        equal(this.next().value, "to")

        //Find end port
        name = this.next()
        const to = this.findPort(name.value, component, name.line)

        if((to.component == component) ? to.type !== "out" : to.type !== "in") {
            //Incorrect flow direction
            console.log("TO: to.comp === comp: " + (to.component === component))
            throw new Error(`[Line ${name.line}] Port configuration mismatch: ${name.value}`)
        }

        return new Connection(from, to)
    }

    private parseConnections(component: Component) : Connection[] {
        equal(this.next().value, "connections")
        
        const connections: Connection[] = []
        while(this.tokens[0].value !== "end") {
            const connection = this.parseConnection(component)
            connections.push(connection)
        }

        //Consume "end" token
        equal(this.next().value, "end")
        
        return connections
    }

    private parseComponent() : Component {
        equal(this.next().value, "component")

        let name = this.next().value
        let component = new Component(name)

        while(this.tokens[0].value !== "end") {

            switch(this.tokens[0].value) {
                case "in": case "out": {
                    let port = this.parsePort(component)
                    component.ports.push(port)
                    break;
                }
                case "dependencies": {
                    let dependencies = this.parseDependencies()
                    component.dependencies.push(...dependencies)
                    break;
                }
                case "connections": {
                    let connections = this.parseConnections(component)
                    component.connections.push(...connections)
                    break;
                }
                default:
                    throw new Error(`[Line ${this.tokens[0].line}] Unexpected token: "${this.tokens[0].value}"`)
            }

        }

        this.next()

        return component

    }

    parse() : Component[] {

        while(this.tokens.length > 0) {
            if(this.tokens[0].value === "component") {
                const component = this.parseComponent()
                this.components.push(component)
            } else {
                console.log(`[Line ${this.tokens[0].line}] Lonely token: ${this.next().value}`)
            }
        }

        return this.components

    }

}