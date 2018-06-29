import { Token } from './tokenizer'
import { ok, equal } from 'assert'
import { Component, Port, Dependency, Connection } from '../component';

export class Parser {

    components: Component[] = []
    tokens: Token[]

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    parsePort() : Port {
        // First token is either "in" or "out"
        const type = this.tokens.shift().value;
        ok(["in", "out"].indexOf(type) >= 0)
        //TODO: some kind of checking for valid types
        let name = this.tokens.shift().value
        return new Port(type, name)
    }

    parseDependency() : Dependency {
        const compName = this.tokens.shift().value
        const component = this.components.find(comp => comp.name === compName)
        if(!component)
            throw new Error(`Unknown Component: ${compName}`)
        const name = this.tokens.shift().value
        return new Dependency(component, name)
    }

    parseDependencies() : Dependency[] {
        equal(this.tokens.shift().value, "dependencies")

        const dependencies: Dependency[] = []
        while(this.tokens[0].value !== "end") {
            const dep = this.parseDependency()
            dependencies.push(dep)
        }

        //Consume "end" token
        equal(this.tokens.shift().value, "end")

        return dependencies
    }

    parseConnection(ports: Port[]) : Connection {
        equal(this.tokens.shift().value, "from")

        //Find output port
        const fromName = this.tokens.shift().value
        const from = ports.find(p => p.name === fromName)
        if(!from)
            throw new Error(`Unknown port: ${fromName}`)
        if(from.type !== "out")
            throw new Error(`Port ${fromName} is Not an output.`)
        
        //Assert
        equal(this.tokens.shift().value, "to")

        //Find input port
        const toName = this.tokens.shift().value
        const to = ports.find(p => p.name === toName)
        if(!to)
            throw new Error(`Unknown port: ${toName}`)
        if(to.type !== "in")
            throw new Error(`Port ${toName} is Not an input.`)

        return new Connection(from, to)
    }

    parseConnections(ports: Port[]) : Connection[] {
        equal(this.tokens.shift().value, "connections")
        
        const connections: Connection[] = []
        while(this.tokens[0].value !== "end") {
            const connection = this.parseConnection(ports)
            connections.push(connection)
        }

        //Consume "end" token
        equal(this.tokens.shift().value, "end")
        
        return connections
    }

    parseComponent() : Component {
        equal(this.tokens.shift().value, "component")

        let name = this.tokens.shift().value
        let component = new Component(name)

        while(this.tokens[0].value !== "end") {

            switch(this.tokens[0].value) {
                case "in": case "out": {
                    let port = this.parsePort()
                    component.ports.push(port)
                    break;
                }
                case "dependencies": {
                    let dependencies = this.parseDependencies()
                    component.dependencies.push(...dependencies)
                    break;
                }
                case "connections": {
                    let connections = this.parseConnections(component.ports)
                    component.connections.push(...connections)
                    break;
                }
                default:
                    throw new Error(`Unexpected token: "${this.tokens[0].value}"`)
            }

        }

        this.tokens.shift()

        return component

    }

    parse() : Component[] {

        const components: Component[] = []

        while(this.tokens.length > 0) {
            if(this.tokens[0].value === "component") {
                const component = this.parseComponent()
                components.push(component)
            } else {
                console.log(`Lonely token: ${this.tokens.shift().value}`)
            }
        }

        return components

    }

}