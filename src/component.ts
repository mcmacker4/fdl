

export class Port {
    
    type: string
    name: string
    component: Component = null

    constructor(type: string, name: string) {
        this.type = type
        this.name = name
    }

}

export class Connection {
    constructor(
        public start: Port,
        public end: Port
    ) {}
}

export class Dependency {
    constructor(
        public component: Component,
        public name: string
    ) {}
}

export class Component {

    name: string
    ports: Port[] = []

    dependencies: Dependency[] = []

    connections: Connection[] = []

    constructor(name: string) {
        this.name = name
    }

}