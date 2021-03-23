import {Row} from "./Row.js";

class Section {

    constructor(args){
    
        var div = this.div = document.createElement("div");
        this.nameh = document.createElement("h3");
        this.table = document.createElement("table");
        
        var tr = document.createElement("tr");
        this.table.appendChild(tr);
        this.nameth = document.createElement("th");
        var valueth = document.createElement("th");
        this.nameth.appendChild(document.createTextNode("Nome"));
        valueth.appendChild(document.createTextNode("Valore"));
        tr.appendChild(this.nameth);
        tr.appendChild(valueth);
        
        div.appendChild(this.nameh);
        div.appendChild(this.table);
        
        args.domNode.appendChild(div);
    }
    
    setName(name) {
        this.nameh.appendChild(document.createTextNode(name));
    }
    
    addRow() {
        var tr = document.createElement("tr");
        this.table.appendChild(tr);
        var nametd = document.createElement("td");
        var valuetd = document.createElement("td");
        tr.appendChild(nametd);
        tr.appendChild(valuetd);
        return new Row({name:nametd, value:valuetd});
    }
}

export {Section}