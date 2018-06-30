

export class Port {
    constructor(
        public type: string,
        public name: string,
        public component: Component
    ) {}
}

export class Connection {
    constructor(
        public from: Port,
        public to: Port
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